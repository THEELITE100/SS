const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');

const createGig = async (req, res) => {
  try {
    const { title, description, category, maxBudget } = req.body;

    if (!title || !description || !maxBudget) {
      return res.status(400).json({ message: 'Please provide title, description, and budget.' });
    }

    const newGig = await Gig.create({
      title,
      description,
      category: category || 'Web Development',
      maxBudget: Number(maxBudget),
      status: 'Open'
    });

    return res.status(201).json({
      message: 'Project published successfully.',
      gig: newGig
    });

  } catch (error) {
    console.error('Create Gig Error:', error);
    return res.status(500).json({ message: 'Server error while publishing project.' });
  }
};

const getGigs = async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ createdAt: -1 });
    return res.status(200).json(gigs);
  } catch (error) {
    console.error('Fetch Gigs Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve marketplace data.' });
  }
};

const submitProposal = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { coverLetter, bidAmount, estimatedDays, proposedMilestones } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'open') {
      return res.status(404).json({ message: 'Gig not found or closed for proposals' });
    }

    const proposal = await Proposal.create({
      gig: gigId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      estimatedDays,
      proposedMilestones,
    });

    res.status(201).json(proposal);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted a proposal for this gig.' });
    }
    res.status(400).json({ message: error.message });
  }
};

const negotiateProposal = async (req, res) => {
  try {
    const { proposedAmount, proposedDays, note } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('gig');

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const isClient = proposal.gig.client.toString() === req.user._id.toString();
    const isFreelancer = proposal.freelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to negotiate this proposal' });
    }

    proposal.negotiationHistory.push({
      sender: isClient ? 'client' : 'freelancer',
      proposedAmount,
      proposedDays,
      note,
    });

    proposal.bidAmount = proposedAmount;
    proposal.estimatedDays = proposedDays;
    proposal.status = 'under_negotiation';

    await proposal.save();
    res.json(proposal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('gig');
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    if (proposal.gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the gig client can accept proposals' });
    }

    proposal.status = 'accepted';
    await proposal.save();

    await Proposal.updateMany(
      { gig: proposal.gig._id, _id: { $ne: proposal._id } },
      { $set: { status: 'rejected' } }
    );

    const gig = await Gig.findById(proposal.gig._id);
    gig.status = 'in_progress';
    gig.selectedFreelancer = proposal.freelancer;
    
    if (proposal.proposedMilestones && proposal.proposedMilestones.length > 0) {
      gig.milestones = proposal.proposedMilestones;
    }
    await gig.save();

    res.json({ message: 'Proposal accepted successfully. Project initiated!', gig, proposal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  const { sendNotification } = require('../services/notificationService');

  await sendNotification({
    recipient: proposal.freelancer,
    sender: req.user._id,
    type: 'PROPOSAL_ACCEPTED',
    title: '🎉 Proposal Accepted!',
    message: `Your bid for "${gig.title}" was accepted. You can begin working on the project!`,
    link: `/dashboard/gigs/${gig._id}`,
  });
};

const deleteGig = async (req, res) => {
  try {
    const gigId = req.params.id;
    const deletedGig = await Gig.findByIdAndDelete(gigId);
    
    if (!deletedGig) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    return res.status(200).json({ message: 'Project securely deleted.' });
  } catch (error) {
    console.error('Delete Gig Error:', error);
    return res.status(500).json({ message: 'Failed to delete project.' });
  }
};

module.exports = { 
  createGig, 
  getGigs,
  deleteGig,
  submitProposal, 
  negotiateProposal, 
  acceptProposal 
};
const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const notify = require('../utils/notify');
const sendResponse = require('../utils/apiResponse');

// @desc    Submit a proposal on a gig
// @route   POST /api/gigs/:gigId/proposals
// @access  Private (freelancer)
const createProposal = asyncHandler(async (req, res) => {
  const { coverLetter, bidAmount, estimatedDays } = req.body;
  const gig = await Gig.findById(req.params.gigId);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (gig.status !== 'open') {
    res.status(400);
    throw new Error('This gig is no longer accepting proposals');
  }

  let proposal;
  try {
    proposal = await Proposal.create({
      gig: gig._id,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      estimatedDays,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('You already submitted a proposal for this gig');
    }
    throw error;
  }

  gig.applicationsCount += 1;
  await gig.save();

  await notify(req.app.get('io'), {
    user: gig.client,
    type: 'proposal_received',
    title: 'New proposal',
    message: `${req.user.name} submitted a proposal on "${gig.title}".`,
    link: `/gigs/${gig._id}`,
  });

  sendResponse(res, 201, true, 'Proposal submitted', { proposal });
});

// @desc    List proposals on a gig (for its owning client)
// @route   GET /api/gigs/:gigId/proposals
// @access  Private (owning client)
const getProposalsForGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the gig owner can view its proposals');
  }

  const proposals = await Proposal.find({ gig: gig._id })
    .populate('freelancer', 'name avatar')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'Proposals fetched', { proposals });
});

// @desc    List the logged-in freelancer's own proposals
// @route   GET /api/proposals/mine
// @access  Private (freelancer)
const getMyProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({ freelancer: req.user._id })
    .populate({ path: 'gig', select: 'title status budgetMin budgetMax currency client', populate: { path: 'client', select: 'name' } })
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'Your proposals fetched', { proposals });
});

// @desc    Accept a proposal — assigns the gig and rejects competing proposals atomically
// @route   PATCH /api/proposals/:id/accept
// @access  Private (owning client)
const acceptProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  const gig = await Gig.findById(proposal.gig);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the gig owner can accept a proposal');
  }
  if (gig.status !== 'open') {
    res.status(400);
    throw new Error('This gig already has an assigned freelancer');
  }
  if (proposal.status !== 'pending') {
    res.status(400);
    throw new Error('This proposal is no longer pending');
  }

  // Multiple documents change together here (the gig + every proposal on
  // it), so this runs inside a transaction — Atlas free-tier clusters are
  // replica sets and support this. Without it, a crash mid-update could
  // leave two proposals both marked "accepted."
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      proposal.status = 'accepted';
      await proposal.save({ session });

      gig.status = 'in_progress';
      gig.assignedFreelancer = proposal.freelancer;
      await gig.save({ session });

      await Proposal.updateMany(
        { gig: gig._id, _id: { $ne: proposal._id }, status: 'pending' },
        { $set: { status: 'rejected' } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  await notify(req.app.get('io'), {
    user: proposal.freelancer,
    type: 'proposal_accepted',
    title: 'Proposal accepted!',
    message: `Your proposal on "${gig.title}" was accepted. The gig is now in progress.`,
    link: `/gigs/${gig._id}`,
  });

  sendResponse(res, 200, true, 'Proposal accepted — the gig is now in progress', { gig, proposal });
});

// @desc    Reject a single proposal
// @route   PATCH /api/proposals/:id/reject
// @access  Private (owning client)
const rejectProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  const gig = await Gig.findById(proposal.gig);
  if (!gig || String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the gig owner can reject a proposal');
  }
  if (proposal.status !== 'pending') {
    res.status(400);
    throw new Error('This proposal is no longer pending');
  }

  proposal.status = 'rejected';
  await proposal.save();

  sendResponse(res, 200, true, 'Proposal rejected', { proposal });
});

// @desc    Withdraw your own proposal
// @route   PATCH /api/proposals/:id/withdraw
// @access  Private (proposal's freelancer)
const withdrawProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }
  if (String(proposal.freelancer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only withdraw your own proposal');
  }
  if (proposal.status !== 'pending') {
    res.status(400);
    throw new Error('Only a pending proposal can be withdrawn');
  }

  proposal.status = 'withdrawn';
  await proposal.save();

  sendResponse(res, 200, true, 'Proposal withdrawn', { proposal });
});

// @desc    Add a counter-offer to a proposal's negotiation history
// @route   POST /api/proposals/:id/negotiate
// @access  Private (either the gig's client or the proposal's freelancer)
const negotiateProposal = asyncHandler(async (req, res) => {
  const { amount, message } = req.body;
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  const gig = await Gig.findById(proposal.gig);
  const isClient = gig && String(gig.client) === String(req.user._id);
  const isFreelancer = String(proposal.freelancer) === String(req.user._id);

  if (!isClient && !isFreelancer) {
    res.status(403);
    throw new Error('You are not part of this negotiation');
  }
  if (proposal.status !== 'pending') {
    res.status(400);
    throw new Error('This proposal is no longer open to negotiation');
  }

  proposal.negotiationHistory.push({ amount, message, by: req.user._id });
  await proposal.save();

  sendResponse(res, 200, true, 'Counter-offer sent', { proposal });
});

module.exports = {
  createProposal,
  getProposalsForGig,
  getMyProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
  negotiateProposal,
};

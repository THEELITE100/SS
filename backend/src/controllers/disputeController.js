const asyncHandler = require('../middleware/asyncHandler');
const Gig = require('../models/Gig');
const Dispute = require('../models/Dispute');
const notify = require('../utils/notify');
const sendResponse = require('../utils/apiResponse');

// @desc    Raise a dispute on an active gig
// @route   POST /api/gigs/:gigId/disputes
// @access  Private (either party on that gig)
const createDispute = asyncHandler(async (req, res) => {
  const { reason, description, milestoneId } = req.body;
  const gig = await Gig.findById(req.params.gigId);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (gig.status !== 'in_progress') {
    res.status(400);
    throw new Error('Disputes can only be raised on a gig that\u2019s currently in progress');
  }

  const isClient = String(gig.client) === String(req.user._id);
  const isFreelancer = gig.assignedFreelancer && String(gig.assignedFreelancer) === String(req.user._id);
  if (!isClient && !isFreelancer) {
    res.status(403);
    throw new Error('You are not part of this gig');
  }

  if (milestoneId && !gig.milestones.id(milestoneId)) {
    res.status(404);
    throw new Error('Milestone not found on this gig');
  }

  const against = isClient ? gig.assignedFreelancer : gig.client;

  const dispute = await Dispute.create({
    gig: gig._id,
    milestoneId: milestoneId || null,
    raisedBy: req.user._id,
    against,
    reason,
    description,
  });

  await notify(req.app.get('io'), {
    user: against,
    type: 'dispute_update',
    title: 'A dispute was raised',
    message: `${req.user.name} raised a dispute on "${gig.title}": ${reason}`,
    link: `/dashboard/disputes/${dispute._id}`,
  });

  sendResponse(res, 201, true, 'Dispute submitted — an admin will review it', { dispute });
});

// @desc    List the logged-in user's disputes (either side)
// @route   GET /api/disputes/mine
// @access  Private
const getMyDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({ $or: [{ raisedBy: req.user._id }, { against: req.user._id }] })
    .populate('raisedBy', 'name')
    .populate('against', 'name')
    .populate('gig', 'title')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'Disputes fetched', { disputes });
});

// @desc    Get a single dispute, with its message thread
// @route   GET /api/disputes/:id
// @access  Private (involved parties or admin)
const getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('raisedBy', 'name avatar')
    .populate('against', 'name avatar')
    .populate('gig', 'title status')
    .populate('resolvedBy', 'name')
    .populate('messages.by', 'name avatar');

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  const isInvolved = [String(dispute.raisedBy._id), String(dispute.against._id)].includes(String(req.user._id));
  if (!isInvolved && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not part of this dispute');
  }

  sendResponse(res, 200, true, 'Dispute fetched', { dispute });
});

// @desc    Add a message to a dispute's thread
// @route   POST /api/disputes/:id/messages
// @access  Private (involved parties or admin)
const addDisputeMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }

  const isInvolved = [String(dispute.raisedBy), String(dispute.against)].includes(String(req.user._id));
  if (!isInvolved && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not part of this dispute');
  }
  if (['resolved', 'rejected'].includes(dispute.status)) {
    res.status(400);
    throw new Error('This dispute is already closed');
  }

  dispute.messages.push({ by: req.user._id, message });
  if (dispute.status === 'open') dispute.status = 'under_review';
  await dispute.save();

  const io = req.app.get('io');
  const otherParties = [dispute.raisedBy, dispute.against].filter((id) => String(id) !== String(req.user._id));
  await Promise.all(
    otherParties.map((userId) =>
      notify(io, {
        user: userId,
        type: 'dispute_update',
        title: 'New message on your dispute',
        message: `${req.user.name} replied on a dispute`,
        link: `/dashboard/disputes/${dispute._id}`,
      })
    )
  );

  sendResponse(res, 200, true, 'Message added', { dispute });
});

module.exports = { createDispute, getMyDisputes, getDispute, addDisputeMessage };

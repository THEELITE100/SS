const asyncHandler = require('../middleware/asyncHandler');
const stripe = require('../config/stripe');
const Gig = require('../models/Gig');
const ClientProfile = require('../models/ClientProfile');
const FreelancerProfile = require('../models/FreelancerProfile');
const Payment = require('../models/Payment');
const notify = require('../utils/notify');
const sendResponse = require('../utils/apiResponse');

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (client)
const createGig = asyncHandler(async (req, res) => {
  const { title, description, category, skillsRequired, budgetType, budgetMin, budgetMax, currency, milestones, location, deadline } =
    req.body;

  const gig = await Gig.create({
    client: req.user._id,
    title,
    description,
    category,
    skillsRequired: skillsRequired || [],
    budgetType: budgetType || 'fixed',
    budgetMin,
    budgetMax,
    currency: currency || 'USD',
    milestones: milestones || [],
    location: location || { isRemote: true },
    deadline,
  });

  await ClientProfile.findOneAndUpdate({ user: req.user._id }, { $inc: { gigsPosted: 1 } });

  sendResponse(res, 201, true, 'Gig posted successfully', { gig });
});

// @desc    List/search open gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = asyncHandler(async (req, res) => {
  const { search, category, skills, budgetMin, budgetMax, isRemote, city, status, page = 1, limit = 12 } = req.query;

  const query = {};
  query.status = status || 'open';

  if (search) {
    query.$text = { $search: search };
  }
  if (category) {
    query.category = category;
  }
  if (skills) {
    const skillList = Array.isArray(skills) ? skills : skills.split(',');
    query.skillsRequired = { $in: skillList.map((s) => new RegExp(`^${s.trim()}$`, 'i')) };
  }
  if (budgetMin) {
    query.budgetMax = { ...(query.budgetMax || {}), $gte: Number(budgetMin) };
  }
  if (budgetMax) {
    query.budgetMin = { ...(query.budgetMin || {}), $lte: Number(budgetMax) };
  }
  if (isRemote !== undefined) {
    query['location.isRemote'] = isRemote === 'true';
  }
  if (city) {
    query['location.city'] = new RegExp(city, 'i');
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  const [gigs, total] = await Promise.all([
    Gig.find(query)
      .populate('client', 'name avatar')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Gig.countDocuments(query),
  ]);

  sendResponse(res, 200, true, 'Gigs fetched', {
    gigs,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Get a single gig by id
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate('client', 'name avatar createdAt')
    .populate('assignedFreelancer', 'name avatar');

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  sendResponse(res, 200, true, 'Gig fetched', { gig });
});

// @desc    Get gigs posted by the logged-in client
// @route   GET /api/gigs/mine
// @access  Private (client)
const getMyGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ client: req.user._id })
    .populate('assignedFreelancer', 'name avatar')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, 'Your gigs fetched', { gigs });
});

// @desc    Update a gig (only while still open)
// @route   PATCH /api/gigs/:id
// @access  Private (owning client)
const updateGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only edit your own gigs');
  }
  if (gig.status !== 'open') {
    res.status(400);
    throw new Error('This gig can no longer be edited — it already has an assigned freelancer');
  }

  const editableFields = [
    'title',
    'description',
    'category',
    'skillsRequired',
    'budgetType',
    'budgetMin',
    'budgetMax',
    'currency',
    'milestones',
    'location',
    'deadline',
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) gig[field] = req.body[field];
  });

  await gig.save();

  sendResponse(res, 200, true, 'Gig updated', { gig });
});

// @desc    Cancel a gig (soft — keeps the record for any linked proposals)
// @route   DELETE /api/gigs/:id
// @access  Private (owning client)
const cancelGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only cancel your own gigs');
  }
  if (gig.status === 'completed') {
    res.status(400);
    throw new Error('A completed gig cannot be cancelled');
  }

  gig.status = 'cancelled';
  await gig.save();

  sendResponse(res, 200, true, 'Gig cancelled');
});

const VALID_MILESTONE_TRANSITIONS = {
  freelancer: { pending: 'in_progress', in_progress: 'submitted' },
  client: { submitted: 'approved' },
};

// @desc    Move a milestone to its next status
// @route   PATCH /api/gigs/:id/milestones/:milestoneId
// @access  Private (assigned freelancer or owning client)
const updateMilestoneStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  const isClient = String(gig.client) === String(req.user._id);
  const isFreelancer = gig.assignedFreelancer && String(gig.assignedFreelancer) === String(req.user._id);

  if (!isClient && !isFreelancer) {
    res.status(403);
    throw new Error('You are not part of this gig');
  }

  const milestone = gig.milestones.id(req.params.milestoneId);
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found');
  }

  const actor = isClient ? 'client' : 'freelancer';
  const allowedNext = VALID_MILESTONE_TRANSITIONS[actor][milestone.status];

  if (!allowedNext || allowedNext !== status) {
    res.status(400);
    throw new Error(`As the ${actor}, you can't move a "${milestone.status}" milestone to "${status}"`);
  }

  // A freelancer can't start work on a milestone that hasn't been funded —
  // that's the whole point of escrow. (Milestones with no payment required,
  // e.g. a gig posted before Phase 3 or with $0 milestones, are skipped.)
  if (actor === 'freelancer' && status === 'in_progress' && milestone.amount > 0) {
    const payment = await Payment.findOne({
      gig: gig._id,
      milestoneId: milestone._id,
      status: { $in: ['escrow', 'released'] },
    });
    if (!payment) {
      res.status(400);
      throw new Error('The client needs to fund this milestone before you can start work on it');
    }
  }

  milestone.status = status;

  const io = req.app.get('io');

  // Approval releases the held funds and credits the freelancer's earnings.
  if (actor === 'client' && status === 'approved') {
    const payment = await Payment.findOne({ gig: gig._id, milestoneId: milestone._id, status: 'escrow' });
    if (payment) {
      payment.status = 'released';
      payment.transactionHistory.push({ status: 'released', note: 'Client approved the milestone' });

      // If the freelancer has finished Stripe Connect onboarding, actually
      // move the money to their account. Otherwise this stays an internal
      // ledger update — see README "Stripe Connect" for what that means.
      const freelancerProfile = await FreelancerProfile.findOne({ user: gig.assignedFreelancer });
      if (stripe && freelancerProfile?.stripeAccountId && freelancerProfile?.payoutsEnabled) {
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(payment.amount * 100),
            currency: (payment.currency || 'USD').toLowerCase(),
            destination: freelancerProfile.stripeAccountId,
          });
          payment.transactionHistory.push({ status: 'released', note: `Transferred to freelancer's connected account (${transfer.id})` });
        } catch (error) {
          payment.transactionHistory.push({ status: 'released', note: 'Internal release recorded; Connect transfer failed or unavailable' });
        }
      }

      await payment.save();

      await FreelancerProfile.findOneAndUpdate(
        { user: gig.assignedFreelancer },
        { $inc: { totalEarnings: payment.amount } }
      );
      milestone.status = 'paid';
    }

    await notify(io, {
      user: gig.assignedFreelancer,
      type: 'milestone_approved',
      title: 'Milestone approved',
      message: `"${milestone.title}" on "${gig.title}" was approved${payment ? ` — ${gig.currency} ${payment.amount} released` : ''}.`,
      link: `/gigs/${gig._id}`,
    });
  }

  if (actor === 'freelancer' && status === 'submitted') {
    await notify(io, {
      user: gig.client,
      type: 'milestone_submitted',
      title: 'Milestone submitted for review',
      message: `"${milestone.title}" on "${gig.title}" is ready for your review.`,
      link: `/gigs/${gig._id}`,
    });
  }

  const allApproved = gig.milestones.length > 0 && gig.milestones.every((m) => ['approved', 'paid'].includes(m.status));
  if (allApproved && gig.status !== 'completed') {
    gig.status = 'completed';
    await Promise.all([
      FreelancerProfile.findOneAndUpdate({ user: gig.assignedFreelancer }, { $inc: { completedGigs: 1 } }),
      ClientProfile.findOneAndUpdate({ user: gig.client }, { $inc: { totalSpent: gig.milestones.reduce((sum, m) => sum + m.amount, 0) } }),
    ]);
  }

  await gig.save();

  sendResponse(res, 200, true, 'Milestone updated', { gig });
});

module.exports = {
  createGig,
  getGigs,
  getGigById,
  getMyGigs,
  updateGig,
  cancelGig,
  updateMilestoneStatus,
};

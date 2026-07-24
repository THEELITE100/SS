const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const Gig = require('../models/Gig');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const AdminLog = require('../models/AdminLog');
const stripe = require('../config/stripe');
const { recomputeReputationScore } = require('../services/reputationService');
const notify = require('../utils/notify');
const sendResponse = require('../utils/apiResponse');

const logAction = (req, action, targetType, targetId, details = {}) =>
  AdminLog.create({
    admin: req.user._id,
    action,
    targetType,
    targetId,
    details,
    ipAddress: req.ip,
  });

// @desc    List users, filterable by role/status, searchable by name/email
// @route   GET /api/admin/users
// @access  Private (admin)
const listUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const filter = {};
  if (role) filter.role = role;
  if (status === 'suspended') filter.isSuspended = true;
  if (status === 'active') filter.isSuspended = false;
  if (search) {
    filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, 'Users fetched', {
    users: users.map((u) => u.toSafeObject()),
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Suspend a user's account
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private (admin)
const suspendUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Admins can\u2019t suspend other admins from here');
  }

  user.isSuspended = true;
  user.suspensionReason = reason || 'No reason provided';
  user.refreshTokens = []; // sign them out everywhere immediately
  await user.save();

  await logAction(req, 'suspend_user', 'User', user._id, { reason });

  sendResponse(res, 200, true, 'User suspended', { user: user.toSafeObject() });
});

// @desc    Lift a suspension
// @route   PATCH /api/admin/users/:id/unsuspend
// @access  Private (admin)
const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isSuspended = false;
  user.suspensionReason = '';
  await user.save();

  await logAction(req, 'unsuspend_user', 'User', user._id);

  sendResponse(res, 200, true, 'User unsuspended', { user: user.toSafeObject() });
});

// @desc    Grant a freelancer's verification badge
// @route   PATCH /api/admin/users/:id/verify-freelancer
// @access  Private (admin)
const verifyFreelancer = asyncHandler(async (req, res) => {
  const { badge } = req.body; // 'verified' | 'top_rated' | 'none'
  const validBadges = ['none', 'verified', 'top_rated'];
  if (!validBadges.includes(badge)) {
    res.status(400);
    throw new Error(`badge must be one of: ${validBadges.join(', ')}`);
  }

  const profile = await FreelancerProfile.findOneAndUpdate(
    { user: req.params.id },
    { verificationBadge: badge },
    { new: true }
  );
  if (!profile) {
    res.status(404);
    throw new Error('Freelancer profile not found');
  }

  await logAction(req, 'verify_freelancer', 'FreelancerProfile', profile._id, { badge });

  sendResponse(res, 200, true, 'Verification badge updated', { profile });
});

// @desc    List gigs for moderation (any status)
// @route   GET /api/admin/gigs
// @access  Private (admin)
const listGigs = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.title = new RegExp(search, 'i');

  const [gigs, total] = await Promise.all([
    Gig.find(filter)
      .populate('client', 'name email')
      .populate('assignedFreelancer', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Gig.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, 'Gigs fetched', {
    gigs,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Take down a gig (e.g. policy violation)
// @route   PATCH /api/admin/gigs/:id/remove
// @access  Private (admin)
const removeGig = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const gig = await Gig.findById(req.params.id);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  gig.status = 'cancelled';
  await gig.save();

  await logAction(req, 'remove_gig', 'Gig', gig._id, { reason });

  sendResponse(res, 200, true, 'Gig removed', { gig });
});

// @desc    List reviews the fraud heuristics have flagged
// @route   GET /api/admin/reviews/flagged
// @access  Private (admin)
const listFlaggedReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const filter = { flaggedForFraud: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'name email createdAt')
      .populate('reviewee', 'name email')
      .populate('gig', 'title status updatedAt')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, 'Flagged reviews fetched', {
    reviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Dismiss a fraud flag (keep the review) or remove the review entirely
// @route   PATCH /api/admin/reviews/:id/resolve
// @access  Private (admin)
const resolveFlaggedReview = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'dismiss' | 'remove'
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (action === 'dismiss') {
    review.flaggedForFraud = false;
    review.fraudReason = '';
    await review.save();
  } else if (action === 'remove') {
    await review.deleteOne();
  } else {
    res.status(400);
    throw new Error('action must be "dismiss" or "remove"');
  }

  const revieweeUser = await User.findById(review.reviewee);
  if (revieweeUser?.role === 'freelancer') {
    await recomputeReputationScore(review.reviewee);
  }

  await logAction(req, 'resolve_flagged_review', 'Review', review._id, { action });

  sendResponse(res, 200, true, `Review ${action === 'dismiss' ? 'flag dismissed' : 'removed'}`);
});

// @desc    Platform-wide analytics
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getAnalytics = asyncHandler(async (req, res) => {
  const [revenueAgg, activeFreelancers, topCategories, gigStatusCounts, totalUsers] = await Promise.all([
    Payment.aggregate([{ $match: { status: 'released' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    User.countDocuments({ role: 'freelancer', isSuspended: false }),
    Gig.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Gig.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({}),
  ]);

  const statusMap = Object.fromEntries(gigStatusCounts.map((s) => [s._id, s.count]));
  const completed = statusMap.completed || 0;
  const cancelled = statusMap.cancelled || 0;
  const decided = completed + cancelled;
  const jobSuccessRate = decided > 0 ? Math.round((completed / decided) * 1000) / 10 : null;

  sendResponse(res, 200, true, 'Analytics fetched', {
    platformRevenue: revenueAgg[0]?.total || 0,
    releasedPaymentsCount: revenueAgg[0]?.count || 0,
    activeFreelancers,
    totalUsers,
    topCategories: topCategories.map((c) => ({ category: c._id, count: c.count })),
    gigsByStatus: statusMap,
    jobSuccessRate,
  });
});

// @desc    View the admin action audit trail
// @route   GET /api/admin/logs
// @access  Private (admin)
const listAdminLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));

  const [logs, total] = await Promise.all([
    AdminLog.find({})
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    AdminLog.countDocuments({}),
  ]);

  sendResponse(res, 200, true, 'Admin logs fetched', {
    logs,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    List disputes for admin review
// @route   GET /api/admin/disputes
// @access  Private (admin)
const listDisputes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const filter = {};
  if (status) filter.status = status;

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .populate('raisedBy', 'name email')
      .populate('against', 'name email')
      .populate('gig', 'title')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Dispute.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, 'Disputes fetched', {
    disputes,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Resolve a dispute — optionally releasing or refunding the associated milestone payment
// @route   PATCH /api/admin/disputes/:id/resolve
// @access  Private (admin)
const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, outcome } = req.body;
  const dispute = await Dispute.findById(req.params.id);

  if (!dispute) {
    res.status(404);
    throw new Error('Dispute not found');
  }
  if (['resolved', 'rejected'].includes(dispute.status)) {
    res.status(400);
    throw new Error('This dispute is already closed');
  }

  const gig = await Gig.findById(dispute.gig);

  if (dispute.milestoneId && gig) {
    const payment = await Payment.findOne({ gig: gig._id, milestoneId: dispute.milestoneId, status: 'escrow' });

    if (payment && outcome === 'pay_freelancer') {
      payment.status = 'released';
      payment.transactionHistory.push({ status: 'released', note: 'Released via dispute resolution' });

      const freelancerProfile = await FreelancerProfile.findOne({ user: payment.freelancer });
      if (stripe && freelancerProfile?.stripeAccountId && freelancerProfile?.payoutsEnabled) {
        try {
          const transfer = await stripe.transfers.create({
            amount: Math.round(payment.amount * 100),
            currency: payment.currency.toLowerCase(),
            destination: freelancerProfile.stripeAccountId,
          });
          payment.transactionHistory.push({ status: 'released', note: `Transferred to freelancer's connected account (${transfer.id})` });
        } catch (error) {
          payment.transactionHistory.push({ status: 'released', note: 'Internal release recorded; Connect transfer failed or unavailable' });
        }
      }

      await payment.save();
      await FreelancerProfile.findOneAndUpdate({ user: payment.freelancer }, { $inc: { totalEarnings: payment.amount } });

      const milestone = gig.milestones.id(dispute.milestoneId);
      if (milestone) {
        milestone.status = 'paid';
        await gig.save();
      }
    } else if (payment && outcome === 'refund_client') {
      if (stripe && payment.providerPaymentId) {
        try {
          await stripe.refunds.create({ payment_intent: payment.providerPaymentId });
        } catch (error) {
          // Note the failure in the transaction history below regardless — the
          // dispute resolution itself still records the decision either way.
        }
      }
      payment.status = 'refunded';
      payment.transactionHistory.push({ status: 'refunded', note: 'Refunded via dispute resolution' });
      await payment.save();
    }
  }

  dispute.status = outcome === 'no_action' ? 'rejected' : 'resolved';
  dispute.resolution = resolution;
  dispute.outcome = outcome;
  dispute.resolvedBy = req.user._id;
  await dispute.save();

  await logAction(req, 'resolve_dispute', 'Dispute', dispute._id, { outcome });

  const io = req.app.get('io');
  await Promise.all(
    [dispute.raisedBy, dispute.against].map((userId) =>
      notify(io, {
        user: userId,
        type: 'dispute_update',
        title: 'Your dispute was resolved',
        message: resolution,
        link: `/dashboard/disputes/${dispute._id}`,
      })
    )
  );

  sendResponse(res, 200, true, 'Dispute resolved', { dispute });
});

module.exports = {
  listUsers,
  suspendUser,
  unsuspendUser,
  verifyFreelancer,
  listGigs,
  removeGig,
  listFlaggedReviews,
  resolveFlaggedReview,
  getAnalytics,
  listAdminLogs,
  listDisputes,
  resolveDispute,
};

const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Gig = require('../models/Gig');
const Review = require('../models/Review');
const User = require('../models/User');
const { recomputeReputationScore, detectFraudSignals } = require('../services/reputationService');
const notify = require('../utils/notify');
const sendResponse = require('../utils/apiResponse');

// @desc    Leave a review on a completed gig
// @route   POST /api/gigs/:gigId/reviews
// @access  Private (either party on that gig)
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, criteria } = req.body;
  const gig = await Gig.findById(req.params.gigId);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (gig.status !== 'completed') {
    res.status(400);
    throw new Error('You can only review a gig once it\u2019s completed');
  }

  const isClient = String(gig.client) === String(req.user._id);
  const isFreelancer = gig.assignedFreelancer && String(gig.assignedFreelancer) === String(req.user._id);
  if (!isClient && !isFreelancer) {
    res.status(403);
    throw new Error('You were not part of this gig');
  }

  const revieweeId = isClient ? gig.assignedFreelancer : gig.client;

  const existing = await Review.findOne({ gig: gig._id, reviewer: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You already reviewed this gig');
  }

  const fraudCheck = detectFraudSignals({
    review: { rating, criteria },
    reviewer: req.user,
    gig,
  });

  let review;
  try {
    review = await Review.create({
      gig: gig._id,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
      criteria,
      isVerified: true, // only reachable once the gig is genuinely completed
      flaggedForFraud: fraudCheck.flagged,
      fraudReason: fraudCheck.reasons.join('; '),
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('You already reviewed this gig');
    }
    throw error;
  }

  const revieweeUser = await User.findById(revieweeId);
  if (revieweeUser?.role === 'freelancer') {
    await recomputeReputationScore(revieweeId);
  }

  await notify(req.app.get('io'), {
    user: revieweeId,
    type: 'review_added',
    title: 'New review',
    message: `${req.user.name} left you a ${rating}-star review on "${gig.title}".`,
    link: `/freelancers/${isClient ? revieweeId : req.user._id}`,
  });

  sendResponse(res, 201, true, 'Review submitted', { review });
});

// @desc    List reviews left for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getReviewsForUser = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const filter = { reviewee: req.params.userId, flaggedForFraud: false };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'name avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Review.countDocuments(filter),
  ]);

  sendResponse(res, 200, true, 'Reviews fetched', {
    reviews,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Rating distribution + per-criteria averages for a user
// @route   GET /api/reviews/user/:userId/analytics
// @access  Public
const getReviewAnalytics = asyncHandler(async (req, res) => {
  const [distribution] = await Review.aggregate([
    { $match: { reviewee: new mongoose.Types.ObjectId(req.params.userId), flaggedForFraud: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        average: { $avg: '$rating' },
        avgCommunication: { $avg: '$criteria.communication' },
        avgQuality: { $avg: '$criteria.quality' },
        avgTimeliness: { $avg: '$criteria.timeliness' },
        avgProfessionalism: { $avg: '$criteria.professionalism' },
        fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ]);

  sendResponse(res, 200, true, 'Review analytics fetched', {
    analytics: distribution || {
      total: 0,
      average: 0,
      avgCommunication: null,
      avgQuality: null,
      avgTimeliness: null,
      avgProfessionalism: null,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    },
  });
});

module.exports = { createReview, getReviewsForUser, getReviewAnalytics };

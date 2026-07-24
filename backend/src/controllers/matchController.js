const asyncHandler = require('../middleware/asyncHandler');
const Gig = require('../models/Gig');
const FreelancerProfile = require('../models/FreelancerProfile');
const { scoreFreelancerForGig } = require('../services/matchingService');
const sendResponse = require('../utils/apiResponse');

// Scoring every candidate on every request is fine at this project's scale
// (a few hundred profiles/gigs). A production system with tens of thousands
// of freelancers would pre-compute embeddings once and use a vector index
// (e.g. MongoDB Atlas Vector Search) instead of scoring candidates live.
const CANDIDATE_POOL_LIMIT = 150;
const RESULTS_LIMIT = 10;

// @desc    Rank freelancers for a specific gig
// @route   GET /api/gigs/:gigId/matches
// @access  Private (owning client)
const getMatchesForGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the gig owner can view match recommendations');
  }

  const candidates = await FreelancerProfile.find({ 'availability.status': { $ne: 'unavailable' } })
    .populate('user', 'name avatar location')
    .limit(CANDIDATE_POOL_LIMIT);

  const scored = await Promise.all(
    candidates.map(async (profile) => ({
      profile,
      ...(await scoreFreelancerForGig(gig, profile)),
    }))
  );

  const ranked = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_LIMIT);

  sendResponse(res, 200, true, 'Matches ranked', {
    matches: ranked,
    usedAI: ranked.some((r) => r.usedAI),
    candidatesConsidered: candidates.length,
  });
});

// @desc    Recommend open gigs for the logged-in freelancer
// @route   GET /api/gigs/recommended
// @access  Private (freelancer)
const getRecommendedGigs = asyncHandler(async (req, res) => {
  const profile = await FreelancerProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Complete your profile first to get recommendations');
  }

  const gigs = await Gig.find({ status: 'open' })
    .populate('client', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(CANDIDATE_POOL_LIMIT);

  const scored = await Promise.all(
    gigs.map(async (gig) => ({
      gig,
      ...(await scoreFreelancerForGig(gig, profile)),
    }))
  );

  const ranked = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULTS_LIMIT);

  sendResponse(res, 200, true, 'Gigs recommended', {
    recommendations: ranked,
    usedAI: ranked.some((r) => r.usedAI),
  });
});

// @desc    Most in-demand skills across recently posted gigs
// @route   GET /api/gigs/trending-skills
// @access  Public
const getTrendingSkills = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const trending = await Gig.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $unwind: '$skillsRequired' },
    { $group: { _id: { $toLower: '$skillsRequired' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, skill: '$_id', count: 1 } },
  ]);

  sendResponse(res, 200, true, 'Trending skills fetched', { trending });
});

module.exports = { getMatchesForGig, getRecommendedGigs, getTrendingSkills };

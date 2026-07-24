const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const sendResponse = require('../utils/apiResponse');

const FREELANCER_EDITABLE_FIELDS = [
  'headline',
  'bio',
  'skills',
  'portfolio',
  'certifications',
  'experience',
  'availability',
  'pricing',
];
const CLIENT_EDITABLE_FIELDS = ['companyName', 'about', 'industry'];

// @desc    Get the logged-in user's own profile
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const Model = req.user.role === 'freelancer' ? FreelancerProfile : ClientProfile;
  const profile = await Model.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error('Profile not found for this account');
  }

  sendResponse(res, 200, true, 'Profile fetched', { profile });
});

// @desc    Update the logged-in user's own profile
// @route   PATCH /api/profiles/me
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const isFreelancer = req.user.role === 'freelancer';
  const Model = isFreelancer ? FreelancerProfile : ClientProfile;
  const editableFields = isFreelancer ? FREELANCER_EDITABLE_FIELDS : CLIENT_EDITABLE_FIELDS;

  const profile = await Model.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found for this account');
  }

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });

  await profile.save();

  sendResponse(res, 200, true, 'Profile updated', { profile });
});

// @desc    Get a freelancer's public profile
// @route   GET /api/profiles/freelancer/:userId
// @access  Public
const getPublicFreelancerProfile = asyncHandler(async (req, res) => {
  const profile = await FreelancerProfile.findOne({ user: req.params.userId }).populate(
    'user',
    'name avatar location createdAt'
  );

  if (!profile) {
    res.status(404);
    throw new Error('Freelancer profile not found');
  }

  // Don't count the owner viewing their own profile
  if (!req.user || String(req.user._id) !== String(req.params.userId)) {
    profile.profileViews += 1;
    await profile.save();
  }

  sendResponse(res, 200, true, 'Freelancer profile fetched', { profile });
});

// @desc    Get a client's public profile
// @route   GET /api/profiles/client/:userId
// @access  Public
const getPublicClientProfile = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.params.userId }).populate(
    'user',
    'name avatar location createdAt'
  );

  if (!profile) {
    res.status(404);
    throw new Error('Client profile not found');
  }

  sendResponse(res, 200, true, 'Client profile fetched', { profile });
});

// @desc    Freelancer's own dashboard analytics: views, proposals, earnings over time
// @route   GET /api/profiles/me/analytics
// @access  Private (freelancer)
const getMyAnalytics = asyncHandler(async (req, res) => {
  const profile = await FreelancerProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found for this account');
  }

  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [proposalStats, monthlyRevenue] = await Promise.all([
    Proposal.aggregate([
      { $match: { freelancer: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { freelancer: new mongoose.Types.ObjectId(req.user._id), status: 'released', updatedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const proposalsByStatus = Object.fromEntries(proposalStats.map((s) => [s._id, s.count]));

  sendResponse(res, 200, true, 'Analytics fetched', {
    profileViews: profile.profileViews,
    totalEarnings: profile.totalEarnings,
    completedGigs: profile.completedGigs,
    reputationScore: profile.reputationScore,
    totalReviews: profile.totalReviews,
    totalProposals: proposalStats.reduce((sum, s) => sum + s.count, 0),
    proposalsByStatus,
    monthlyRevenue: monthlyRevenue.map((m) => ({ month: m._id, amount: m.total })),
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicFreelancerProfile,
  getPublicClientProfile,
  getMyAnalytics,
};

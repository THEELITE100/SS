const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const FreelancerProfile = require('../models/FreelancerProfile');

const getFreelancerDashboardAnalytics = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const profile = await FreelancerProfile.findOne({ user: freelancerId });
    const profileViews = profile ? profile.profileViews : 0;
    const reputationScore = profile ? profile.reputationScore : 5.0;
    const completedGigsCount = profile ? profile.completedGigsCount : 0;

    const proposalStats = await Proposal.aggregate([
      { $match: { freelancer: new mongoose.Types.ObjectId(freelancerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const proposalCounts = {
      submitted: 0,
      under_negotiation: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };
    let totalProposals = 0;

    proposalStats.forEach((stat) => {
      proposalCounts[stat._id] = stat.count;
      totalProposals += stat.count;
    });

    const winRate = totalProposals > 0
      ? Math.round((proposalCounts.accepted / totalProposals) * 100)
      : 0;

    const profileConversionRate = profileViews > 0
      ? Math.round((completedGigsCount / profileViews) * 100 * 10) / 10
      : 0;

    const financialStats = await Payment.aggregate([
      {
        $match: {
          freelancer: new mongoose.Types.ObjectId(freelancerId),
          status: 'released',
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$netFreelancerAmount' },
          grossBilled: { $sum: '$grossAmount' },
          platformFeesPaid: { $sum: '$platformFee' },
          paidMilestonesCount: { $sum: 1 },
        },
      },
    ]);

    const earningsOverview = financialStats[0] || {
      totalEarnings: 0,
      grossBilled: 0,
      platformFeesPaid: 0,
      paidMilestonesCount: 0,
    };

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          freelancer: new mongoose.Types.ObjectId(freelancerId),
          status: 'released',
          updatedAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          revenue: { $sum: '$netFreelancerAmount' },
          milestonesCompleted: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedRevenueChart = monthlyRevenue.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      milestonesCompleted: item.milestonesCompleted,
    }));

    const feedbackMetrics = await Review.aggregate([
      {
        $match: {
          freelancer: new mongoose.Types.ObjectId(freelancerId),
          isFlaggedForFraud: false,
        },
      },
      {
        $group: {
          _id: null,
          avgQuality: { $avg: '$metrics.quality' },
          avgCommunication: { $avg: '$metrics.communication' },
          avgTimeliness: { $avg: '$metrics.timeliness' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = await Review.aggregate([
      {
        $match: {
          freelancer: new mongoose.Types.ObjectId(freelancerId),
          isFlaggedForFraud: false,
        },
      },
      {
        $project: {
          roundedRating: { $floor: '$overallRating' },
        },
      },
      {
        $group: {
          _id: '$roundedRating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const formattedDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach((item) => {
      if (item._id >= 1 && item._id <= 5) {
        formattedDistribution[item._id] = item.count;
      }
    });

    const metricsSummary = feedbackMetrics[0] || {
      avgQuality: 5.0,
      avgCommunication: 5.0,
      avgTimeliness: 5.0,
      totalReviews: 0,
    };

    res.status(200).json({
      success: true,
      overview: {
        reputationScore,
        profileViews,
        completedGigsCount,
        profileConversionRate: `${profileConversionRate}%`,
      },
      funnel: {
        totalProposals,
        proposalCounts,
        winRate: `${winRate}%`,
      },
      earnings: earningsOverview,
      monthlyRevenueChart: formattedRevenueChart,
      feedback: {
        averages: {
          quality: Math.round(metricsSummary.avgQuality * 10) / 10,
          communication: Math.round(metricsSummary.avgCommunication * 10) / 10,
          timeliness: Math.round(metricsSummary.avgTimeliness * 10) / 10,
        },
        totalReviews: metricsSummary.totalReviews,
        ratingDistribution: formattedDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFreelancerDashboardAnalytics };
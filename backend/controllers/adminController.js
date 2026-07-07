const User = require('../models/User');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');
const { updateWeightedReputation } = require('../services/reputationService');

const getPlatformAnalytics = async (req, res) => {
  try {
    const financialStats = await Payment.aggregate([
      { $match: { status: 'released' } },
      {
        $group: {
          _id: null,
          totalGrossVolume: { $sum: '$grossAmount' },
          totalPlatformRevenue: { $sum: '$platformFee' },
          totalFreelancerEarnings: { $sum: '$netFreelancerAmount' },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    const financials = financialStats[0] || {
      totalGrossVolume: 0,
      totalPlatformRevenue: 0,
      totalFreelancerEarnings: 0,
      transactionCount: 0,
    };

    const totalClients = await User.countDocuments({ role: 'client' });
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    const totalGigs = await Gig.countDocuments();
    const completedGigs = await Gig.countDocuments({ status: 'completed' });
    const cancelledGigs = await Gig.countDocuments({ status: 'cancelled' });
    
    const resolvedGigs = completedGigs + cancelledGigs;
    const jobSuccessRate = resolvedGigs > 0 ? Math.round((completedGigs / resolvedGigs) * 100) : 100;

    const topCategories = await Gig.aggregate([
      {
        $group: {
          _id: '$category',
          gigCount: { $sum: 1 },
        },
      },
      { $sort: { gigCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      financials,
      users: {
        totalClients,
        totalFreelancers,
        suspendedUsers,
      },
      gigs: {
        totalGigs,
        completedGigs,
        cancelledGigs,
        jobSuccessRate: `${jobSuccessRate}%`,
      },
      topCategories: topCategories.map((cat) => ({
        category: cat._id,
        count: cat.gigCount,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const manageUserSuspension = async (req, res) => {
  const { isSuspended, reason } = req.body;

  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot suspend an admin account' });
    }

    user.isSuspended = Boolean(isSuspended);
    user.suspensionReason = isSuspended ? reason || 'Violation of Platform Terms' : null;
    await user.save();

    await AdminLog.create({
      admin: req.user._id,
      action: isSuspended ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      targetId: user._id,
      targetType: 'User',
      details: reason || `Changed suspension status to ${isSuspended}`,
    });

    res.status(200).json({
      message: `User account successfully ${isSuspended ? 'suspended' : 'reactivated'}.`,
      user: { _id: user._id, name: user.name, email: user.email, isSuspended: user.isSuspended },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFlaggedReviews = async (req, res) => {
  try {
    const flaggedReviews = await Review.find({ isFlaggedForFraud: true })
      .populate('reviewer', 'name email')
      .populate('freelancer', 'name email')
      .populate('gig', 'title budgetRange')
      .sort({ createdAt: -1 });

    res.status(200).json(flaggedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adjudicateReview = async (req, res) => {
  const { decision } = req.body; 

  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (decision === 'APPROVE') {
      review.isFlaggedForFraud = false;
      review.fraudReason = null;
      await review.save();

      await updateWeightedReputation(review.freelancer);

      await AdminLog.create({
        admin: req.user._id,
        action: 'APPROVE_FLAGGED_REVIEW',
        targetId: review._id,
        targetType: 'Review',
        details: 'Override heuristics and published review.',
      });

      return res.status(200).json({ message: 'Review approved and reputation recalculated.', review });
    } else if (decision === 'DELETE') {
      await Review.findByIdAndDelete(req.params.reviewId);

      await AdminLog.create({
        admin: req.user._id,
        action: 'DELETE_FLAGGED_REVIEW',
        targetId: review._id,
        targetType: 'Review',
        details: `Confirmed fraud: ${review.fraudReason}`,
      });

      return res.status(200).json({ message: 'Fraudulent review permanently deleted.' });
    }

    res.status(400).json({ message: 'Invalid decision payload. Must be APPROVE or DELETE.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlatformAnalytics,
  manageUserSuspension,
  getFlaggedReviews,
  adjudicateReview,
};
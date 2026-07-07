const Review = require('../models/Review');
const FreelancerProfile = require('../models/FreelancerProfile');
const Payment = require('../models/Payment');

const evaluateReviewFraud = async (gig, reviewerId, freelancerId) => {
  const flags = [];

  const hoursSinceCreation = (Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60);
  if (gig.budgetRange.max >= 10000 && hoursSinceCreation < 6) {
    flags.push('Unusually rapid completion for high-value contract (< 6 hours).');
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentReviewsCount = await Review.countDocuments({
    freelancer: freelancerId,
    createdAt: { $gte: oneDayAgo },
  });
  if (recentReviewsCount >= 4) {
    flags.push(`High review velocity spike detected (${recentReviewsCount + 1} reviews in 24h).`);
  }

  const releasedPayment = await Payment.findOne({
    gig: gig._id,
    status: 'released',
  });
  if (!releasedPayment) {
    flags.push('No confirmed released payout found on financial ledger.');
  }

  return {
    isFlagged: flags.length > 0,
    reason: flags.length > 0 ? flags.join(' | ') : null,
  };
};

const updateWeightedReputation = async (freelancerId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          freelancer: freelancerId,
          isFlaggedForFraud: false,
        },
      },
      {
        $group: {
          _id: '$freelancer',
          totalWeightedScore: { $sum: { $multiply: ['$overallRating', '$projectValue'] } },
          totalProjectValue: { $sum: '$projectValue' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const { totalWeightedScore, totalProjectValue, reviewCount } = stats[0];
      
      let weightedScore = totalProjectValue > 0 
        ? totalWeightedScore / totalProjectValue 
        : 5.0;

      weightedScore = Math.round(weightedScore * 100) / 100;

      await FreelancerProfile.findOneAndUpdate(
        { user: freelancerId },
        {
          reputationScore: weightedScore,
          completedGigsCount: reviewCount,
        }
      );
    }
  } catch (error) {
    console.error('Failed to recalculate weighted reputation:', error.message);
  }
};

module.exports = { evaluateReviewFraud, updateWeightedReputation };
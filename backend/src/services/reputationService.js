const Review = require('../models/Review');
const FreelancerProfile = require('../models/FreelancerProfile');

const RECENCY_WEIGHT = (ageInDays) => {
  if (ageInDays <= 90) return 1;
  if (ageInDays <= 180) return 0.85;
  return 0.7;
};

/**
 * Blends the overall star rating with the detailed criteria (when given),
 * then weights by how recent the review is, so a handful of old reviews
 * can't permanently outweigh a freelancer's recent track record.
 */
const effectiveRating = (review) => {
  const criteriaValues = Object.values(review.criteria || {}).filter((v) => typeof v === 'number');
  if (criteriaValues.length === 0) return review.rating;
  const criteriaAvg = criteriaValues.reduce((sum, v) => sum + v, 0) / criteriaValues.length;
  return (review.rating + criteriaAvg) / 2;
};

/** Recomputes and persists a freelancer's weighted reputation score from every review they've received. */
const recomputeReputationScore = async (freelancerUserId) => {
  const reviews = await Review.find({ reviewee: freelancerUserId, flaggedForFraud: false });

  if (reviews.length === 0) {
    await FreelancerProfile.findOneAndUpdate({ user: freelancerUserId }, { reputationScore: 0, totalReviews: 0 });
    return 0;
  }

  let weightedSum = 0;
  let weightTotal = 0;

  for (const review of reviews) {
    const ageInDays = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const weight = RECENCY_WEIGHT(ageInDays);
    const score = effectiveRating(review);

    review.weightedScore = Math.round(score * weight * 100) / 100;
    weightedSum += score * weight;
    weightTotal += weight;
  }

  await Review.bulkWrite(
    reviews.map((r) => ({ updateOne: { filter: { _id: r._id }, update: { weightedScore: r.weightedScore } } }))
  );

  const reputationScore = Math.round((weightedSum / weightTotal) * 100) / 100;

  await FreelancerProfile.findOneAndUpdate(
    { user: freelancerUserId },
    { reputationScore, totalReviews: reviews.length }
  );

  return reputationScore;
};

/**
 * Rule-based, explainable heuristics — not a claim of ML-grade fraud
 * detection. Each check states exactly what it looked at, so a human can
 * verify (or dismiss) the flag in the admin review queue.
 */
const detectFraudSignals = ({ review, reviewer, gig }) => {
  const reasons = [];

  const secondsSinceCompletion = gig.updatedAt ? (Date.now() - new Date(gig.updatedAt).getTime()) / 1000 : Infinity;
  if (secondsSinceCompletion < 60) {
    reasons.push('Submitted within 60 seconds of the gig being marked complete');
  }

  const reviewerAgeHours = (Date.now() - new Date(reviewer.createdAt).getTime()) / (1000 * 60 * 60);
  if (reviewerAgeHours < 24 && (review.rating === 5 || review.rating === 1)) {
    reasons.push('Reviewer account is less than 24 hours old and left an extreme rating');
  }

  const criteriaValues = Object.values(review.criteria || {}).filter((v) => typeof v === 'number');
  if (criteriaValues.length > 0) {
    const criteriaAvg = criteriaValues.reduce((sum, v) => sum + v, 0) / criteriaValues.length;
    if (Math.abs(review.rating - criteriaAvg) >= 2.5) {
      reasons.push('Overall rating doesn\u2019t match the detailed criteria scores');
    }
  }

  return { flagged: reasons.length > 0, reasons };
};

module.exports = { recomputeReputationScore, detectFraudSignals, effectiveRating };

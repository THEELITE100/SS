const Review = require('../models/Review');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const { evaluateReviewFraud, updateWeightedReputation } = require('../services/reputationService');

const createReview = async (req, res) => {
  const { gigId, quality, communication, timeliness, comment } = req.body;

  try {
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the hiring client can submit reviews for this project' });
    }

    if (!gig.selectedFreelancer) {
      return res.status(400).json({ message: 'Cannot review an unassigned gig' });
    }

    const payments = await Payment.find({ gig: gigId, status: 'released' });
    const totalPaidValue = payments.reduce((acc, curr) => acc + curr.grossAmount, 0);

    const overallRating = Math.round(((Number(quality) + Number(communication) + Number(timeliness)) / 3) * 10) / 10;

    const fraudCheck = await evaluateReviewFraud(gig, req.user._id, gig.selectedFreelancer);

    const review = await Review.create({
      gig: gigId,
      reviewer: req.user._id,
      freelancer: gig.selectedFreelancer,
      metrics: { quality, communication, timeliness },
      overallRating,
      comment,
      projectValue: totalPaidValue || 1,
      isVerifiedWork: totalPaidValue > 0,
      isFlaggedForFraud: fraudCheck.isFlagged,
      fraudReason: fraudCheck.reason,
    });

    if (!fraudCheck.isFlagged) {
      await updateWeightedReputation(gig.selectedFreelancer);
    }

    res.status(201).json({
      success: true,
      message: fraudCheck.isFlagged
        ? 'Review submitted and flagged for admin verification due to anomaly detection.'
        : 'Review published successfully!',
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this project.' });
    }
    res.status(500).json({ message: error.message });
  }
};

const getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      freelancer: req.params.freelancerId,
      isFlaggedForFraud: false,
    })
      .populate('reviewer', 'name location')
      .populate('gig', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getFreelancerReviews };
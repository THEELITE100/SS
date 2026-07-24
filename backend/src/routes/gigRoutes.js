const express = require('express');
const {
  createGig,
  getGigs,
  getGigById,
  getMyGigs,
  updateGig,
  cancelGig,
  updateMilestoneStatus,
} = require('../controllers/gigController');
const { createProposal, getProposalsForGig } = require('../controllers/proposalController');
const { createMilestonePayment, getPaymentsForGig } = require('../controllers/paymentController');
const { getMatchesForGig, getRecommendedGigs, getTrendingSkills } = require('../controllers/matchController');
const { createReview } = require('../controllers/reviewController');
const { createDispute } = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const { createGigValidator, updateGigValidator } = require('../validators/gigValidators');
const { createProposalValidator } = require('../validators/proposalValidators');
const { createReviewValidator } = require('../validators/reviewValidators');
const { createDisputeValidator } = require('../validators/disputeValidators');

const router = express.Router();

// Static-path routes must come before "/:id" — Express matches routes in
// registration order, so "/:id" would otherwise swallow these as a literal id.
router.get('/', getGigs);
router.get('/mine', protect, authorize('client'), getMyGigs);
router.get('/recommended', protect, authorize('freelancer'), getRecommendedGigs);
router.get('/trending-skills', getTrendingSkills);
router.post('/', protect, authorize('client'), createGigValidator, validateRequest, createGig);

router.get('/:id', getGigById);
router.patch('/:id', protect, authorize('client'), updateGigValidator, validateRequest, updateGig);
router.delete('/:id', protect, authorize('client'), cancelGig);
router.patch('/:id/milestones/:milestoneId', protect, updateMilestoneStatus);
router.post('/:gigId/milestones/:milestoneId/payment', protect, authorize('client'), createMilestonePayment);
router.get('/:gigId/payments', protect, getPaymentsForGig);
router.get('/:gigId/matches', protect, authorize('client'), getMatchesForGig);

// Nested under a gig: submit a proposal / view all proposals for that gig
router
  .route('/:gigId/proposals')
  .post(protect, authorize('freelancer'), createProposalValidator, validateRequest, createProposal)
  .get(protect, authorize('client'), getProposalsForGig);

router.post('/:gigId/reviews', protect, createReviewValidator, validateRequest, createReview);
router.post('/:gigId/disputes', protect, createDisputeValidator, validateRequest, createDispute);

module.exports = router;

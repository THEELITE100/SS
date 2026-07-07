const express = require('express');
const router = express.Router();
const {
  getPlatformAnalytics,
  manageUserSuspension,
  getFlaggedReviews,
  adjudicateReview,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/analytics', getPlatformAnalytics);
router.put('/users/:userId/suspend', manageUserSuspension);
router.get('/reviews/flagged', getFlaggedReviews);
router.put('/reviews/:reviewId/adjudicate', adjudicateReview);

module.exports = router;
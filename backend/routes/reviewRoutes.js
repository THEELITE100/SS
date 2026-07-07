const express = require('express');
const router = express.Router();
const { createReview, getFreelancerReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('client'), createReview);
router.get('/freelancer/:freelancerId', getFreelancerReviews);

module.exports = router;
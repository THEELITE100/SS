const express = require('express');
const { getReviewsForUser, getReviewAnalytics } = require('../controllers/reviewController');

const router = express.Router();

router.get('/user/:userId', getReviewsForUser);
router.get('/user/:userId/analytics', getReviewAnalytics);

module.exports = router;

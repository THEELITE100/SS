const express = require('express');
const router = express.Router();
const { getFreelancerDashboardAnalytics } = require('../controllers/freelancerAnalyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('freelancer'), getFreelancerDashboardAnalytics);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/recommendations', protect, authorize('client', 'admin'), getRecommendations);

module.exports = router;
const express = require('express');
const { confirmMilestonePayment, startConnectOnboarding, getConnectStatus } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/connect/onboard', protect, authorize('freelancer'), startConnectOnboarding);
router.get('/connect/status', protect, authorize('freelancer'), getConnectStatus);
router.post('/:paymentId/confirm', protect, confirmMilestonePayment);

module.exports = router;

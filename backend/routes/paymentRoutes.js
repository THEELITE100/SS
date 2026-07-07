const express = require('express');
const router = express.Router();
const {
  fundMilestoneEscrow,
  verifyEscrowPayment,
  releaseMilestonePayout,
  refundEscrow,
  getTransactionHistory,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/escrow/fund', protect, authorize('client'), fundMilestoneEscrow);
router.post('/escrow/verify', protect, authorize('client'), verifyEscrowPayment);
router.post('/escrow/release', protect, authorize('client'), releaseMilestonePayout);
router.post('/escrow/refund', protect, authorize('client', 'admin'), refundEscrow);
router.get('/history', protect, getTransactionHistory);

module.exports = router;
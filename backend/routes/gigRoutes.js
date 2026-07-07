const express = require('express');
const router = express.Router();
const {
  createGig,
  submitProposal,
  negotiateProposal,
  acceptProposal,
} = require('../controllers/gigController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('client', 'admin'), createGig);
router.post('/:gigId/proposals', protect, authorize('freelancer'), submitProposal);

router.put('/proposals/:id/negotiate', protect, negotiateProposal);
router.put('/proposals/:id/accept', protect, authorize('client'), acceptProposal);

module.exports = router;
const express = require('express');
const {
  getMyProposals,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
  negotiateProposal,
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const { negotiateProposalValidator } = require('../validators/proposalValidators');

const router = express.Router();

router.get('/mine', protect, authorize('freelancer'), getMyProposals);
router.patch('/:id/accept', protect, authorize('client'), acceptProposal);
router.patch('/:id/reject', protect, authorize('client'), rejectProposal);
router.patch('/:id/withdraw', protect, authorize('freelancer'), withdrawProposal);
router.post('/:id/negotiate', protect, negotiateProposalValidator, validateRequest, negotiateProposal);

module.exports = router;

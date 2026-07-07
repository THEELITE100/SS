const express = require('express');
const router = express.Router();
const {
  createDispute,
  submitEvidence,
  getDisputes,
  resolveDispute,
} = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createDispute)
  .get(getDisputes);

router.post('/:id/evidence', submitEvidence);
router.put('/:id/resolve', authorize('admin'), resolveDispute);

module.exports = router;
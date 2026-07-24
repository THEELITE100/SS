const express = require('express');
const { getMyDisputes, getDispute, addDisputeMessage } = require('../controllers/disputeController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const { addDisputeMessageValidator } = require('../validators/disputeValidators');

const router = express.Router();

router.get('/mine', protect, getMyDisputes);
router.get('/:id', protect, getDispute);
router.post('/:id/messages', protect, addDisputeMessageValidator, validateRequest, addDisputeMessage);

module.exports = router;

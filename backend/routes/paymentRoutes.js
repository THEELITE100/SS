const express = require('express');
const router = express.Router();

const { 
  createEscrowSession, 
  releaseMilestonePayout 
} = require('../controllers/paymentController');

router.post('/create-escrow-session', createEscrowSession);

router.post('/release-payout', releaseMilestonePayout);

module.exports = router;
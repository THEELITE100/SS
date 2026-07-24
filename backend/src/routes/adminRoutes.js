const express = require('express');
const {
  listUsers,
  suspendUser,
  unsuspendUser,
  verifyFreelancer,
  listGigs,
  removeGig,
  listFlaggedReviews,
  resolveFlaggedReview,
  getAnalytics,
  listAdminLogs,
  listDisputes,
  resolveDispute,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const { resolveDisputeValidator } = require('../validators/disputeValidators');

const router = express.Router();

// Every route here requires an authenticated admin
router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/logs', listAdminLogs);

router.get('/users', listUsers);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.patch('/users/:id/verify-freelancer', verifyFreelancer);

router.get('/gigs', listGigs);
router.patch('/gigs/:id/remove', removeGig);

router.get('/reviews/flagged', listFlaggedReviews);
router.patch('/reviews/:id/resolve', resolveFlaggedReview);

router.get('/disputes', listDisputes);
router.patch('/disputes/:id/resolve', resolveDisputeValidator, validateRequest, resolveDispute);

module.exports = router;

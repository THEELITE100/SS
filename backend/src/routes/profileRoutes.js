const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getPublicFreelancerProfile,
  getPublicClientProfile,
  getMyAnalytics,
} = require('../controllers/profileController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const {
  updateFreelancerProfileValidator,
  updateClientProfileValidator,
} = require('../validators/profileValidators');

const router = express.Router();

// Runs whichever validator fits the logged-in user's role
const updateProfileValidator = (req, res, next) => {
  const chain = req.user?.role === 'freelancer' ? updateFreelancerProfileValidator : updateClientProfileValidator;
  return Promise.all(chain.map((rule) => rule.run(req))).then(() => next());
};

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateProfileValidator, validateRequest, updateMyProfile);
router.get('/me/analytics', protect, authorize('freelancer'), getMyAnalytics);
router.get('/freelancer/:userId', optionalAuth, getPublicFreelancerProfile);
router.get('/client/:userId', getPublicClientProfile);

module.exports = router;

const express = require('express');
const passport = require('passport');
const {
  register,
  login,
  verifyLogin2FA,
  googleCallback,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  getMe,
  setup2FA,
  verify2FASetup,
  disable2FA,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators');

const router = express.Router();

// --- Local email/password auth ---
router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.post('/login/2fa', authLimiter, verifyLogin2FA);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// --- Email verification ---
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// --- Password reset ---
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validateRequest, resetPassword);

// --- Google OAuth ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  (req, res, next) =>
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
    })(req, res, next),
  googleCallback
);

// --- Two-factor authentication (TOTP, no external service required) ---
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify-setup', protect, verify2FASetup);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;

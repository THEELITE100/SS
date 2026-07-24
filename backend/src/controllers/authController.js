const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const ClientProfile = require('../models/ClientProfile');
const FreelancerProfile = require('../models/FreelancerProfile');
const sendEmail = require('../utils/sendEmail');
const { sendAuthTokens, hashToken } = require('../utils/generateTokens');
const sendResponse = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'freelancer' ? 'freelancer' : 'client',
    authProvider: 'local',
  });

  if (user.role === 'freelancer') {
    await FreelancerProfile.create({ user: user._id });
  } else {
    await ClientProfile.create({ user: user._id });
  }

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your SkillSphere account',
    html: `<p>Hi ${user.name},</p><p>Welcome to SkillSphere! Please verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
    text: `Welcome to SkillSphere! Verify your email: ${verifyUrl}`,
  });

  const accessToken = await sendAuthTokens(res, user);

  sendResponse(
    res,
    201,
    true,
    'Account created. Check your email to verify your account.',
    { user: user.toSafeObject(), accessToken }
  );
});

// @desc    Log in with email + password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || user.authProvider !== 'local' || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isSuspended) {
    res.status(403);
    throw new Error('Your account has been suspended. Contact support.');
  }

  if (user.twoFactorEnabled) {
    const challengeToken = jwt.sign({ id: user._id, purpose: '2fa-challenge' }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '10m',
    });
    return sendResponse(res, 200, true, 'Two-factor authentication required', {
      twoFactorRequired: true,
      challengeToken,
    });
  }

  user.lastLogin = new Date();
  const accessToken = await sendAuthTokens(res, user);

  sendResponse(res, 200, true, 'Login successful', { user: user.toSafeObject(), accessToken });
});

// @desc    Complete login by verifying a TOTP code
// @route   POST /api/auth/login/2fa
// @access  Public (requires a short-lived challenge token from /login)
const verifyLogin2FA = asyncHandler(async (req, res) => {
  const { challengeToken, code } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(challengeToken, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Challenge expired, please log in again');
  }

  if (decoded.purpose !== '2fa-challenge') {
    res.status(401);
    throw new Error('Invalid challenge token');
  }

  const user = await User.findById(decoded.id).select('+twoFactorSecret');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });

  if (!verified) {
    res.status(401);
    throw new Error('Invalid authentication code');
  }

  user.lastLogin = new Date();
  const accessToken = await sendAuthTokens(res, user);

  sendResponse(res, 200, true, 'Login successful', { user: user.toSafeObject(), accessToken });
});

// @desc    Google OAuth callback — issues tokens and redirects to the frontend
// @route   GET /api/auth/google/callback
// @access  Public (passport populates req.user)
const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  const existingProfile =
    user.role === 'freelancer'
      ? await FreelancerProfile.findOne({ user: user._id })
      : await ClientProfile.findOne({ user: user._id });

  if (!existingProfile) {
    if (user.role === 'freelancer') {
      await FreelancerProfile.create({ user: user._id });
    } else {
      await ClientProfile.create({ user: user._id });
    }
  }

  const accessToken = await sendAuthTokens(res, user);

  // Token travels in the URL fragment so it's never sent to any server or logged
  res.redirect(`${process.env.CLIENT_URL}/oauth/callback#accessToken=${accessToken}`);
});

// @desc    Verify a user's email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    res.status(400);
    throw new Error('Verification link is invalid or has expired');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, true, 'Email verified successfully');
});

// @desc    Resend the verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return sendResponse(res, 200, true, 'Email is already verified');
  }

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your SkillSphere account',
    html: `<p>Verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    text: `Verify your email: ${verifyUrl}`,
  });

  sendResponse(res, 200, true, 'Verification email sent');
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond identically to avoid leaking which emails are registered
  if (!user || user.authProvider !== 'local') {
    return sendResponse(res, 200, true, 'If an account exists for this email, a reset link has been sent');
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your SkillSphere password',
    html: `<p>You requested a password reset. This link expires in 30 minutes:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    text: `Reset your password: ${resetUrl}`,
  });

  sendResponse(res, 200, true, 'If an account exists for this email, a reset link has been sent');
});

// @desc    Reset password using a token from the reset email
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    res.status(400);
    throw new Error('Reset link is invalid or has expired');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // log out every existing session for security
  await user.save();

  sendResponse(res, 200, true, 'Password reset successful. Please log in with your new password.');
});

// @desc    Exchange a valid refresh cookie for a new access token
// @route   POST /api/auth/refresh
// @access  Public (requires refreshToken cookie)
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Refresh token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  const tokenHash = hashToken(token);
  const storedToken = user.refreshTokens.find((rt) => rt.tokenHash === tokenHash);

  if (!storedToken) {
    res.status(401);
    throw new Error('Refresh token not recognized, please log in again');
  }

  // Rotate: invalidate the used token, issue a brand new pair
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
  const accessToken = await sendAuthTokens(res, user);

  sendResponse(res, 200, true, 'Token refreshed', { accessToken });
});

// @desc    Log out (revokes the current refresh token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    const tokenHash = hashToken(token);
    req.user.refreshTokens = req.user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
    await req.user.save();
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  sendResponse(res, 200, true, 'Logged out successfully');
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, 200, true, 'User fetched', { user: req.user.toSafeObject() });
});

// @desc    Start 2FA setup: generates a secret + QR code
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `${process.env.TWO_FA_APP_NAME || 'SkillSphere'} (${req.user.email})`,
  });

  req.user.twoFactorTempSecret = secret.base32;
  await req.user.save();

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  sendResponse(res, 200, true, 'Scan this QR code with your authenticator app', {
    qrCode: qrCodeDataUrl,
    manualEntryKey: secret.base32,
  });
});

// @desc    Confirm 2FA setup with a code from the authenticator app
// @route   POST /api/auth/2fa/verify-setup
// @access  Private
const verify2FASetup = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user._id).select('+twoFactorTempSecret');

  if (!user.twoFactorTempSecret) {
    res.status(400);
    throw new Error('No pending 2FA setup found. Please start setup again.');
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });

  if (!verified) {
    res.status(400);
    throw new Error('Invalid code. Please try again.');
  }

  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorTempSecret = undefined;
  user.twoFactorEnabled = true;
  await user.save();

  sendResponse(res, 200, true, 'Two-factor authentication enabled');
});

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (user.authProvider === 'local') {
    if (!password || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Incorrect password');
    }
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  sendResponse(res, 200, true, 'Two-factor authentication disabled');
});

module.exports = {
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
};

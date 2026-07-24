const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

// Verifies the access token and attaches the user document to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  if (user.isSuspended) {
    res.status(403);
    throw new Error('Account suspended. Contact support.');
  }

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never blocks the
// request either way — for public routes that behave slightly differently
// when the visitor happens to be logged in (e.g. not counting a profile
// owner's own visit as a view).
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isSuspended) req.user = user;
    } catch (error) {
      // Invalid/expired token on an optional route — proceed as anonymous
    }
  }

  next();
});

// Restricts a route to specific roles, e.g. authorize('admin')
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user?.role || 'unknown'}' is not permitted to access this resource`);
    }
    next();
  };

module.exports = { protect, optionalAuth, authorize };

const Stripe = require('stripe');

// Mirrors the sendEmail.js pattern: if no key is configured yet, payment
// routes return a clear "not configured" error instead of crashing the
// whole server. Everything else keeps working without Stripe set up.
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (!stripe) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set — payment endpoints will respond with a clear 503 until it is.');
}

module.exports = stripe;

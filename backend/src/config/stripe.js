const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

if (!stripe) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set — payment endpoints will respond with a clear 503 until it is.');
}

module.exports = stripe;

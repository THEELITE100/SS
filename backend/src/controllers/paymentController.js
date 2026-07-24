const asyncHandler = require('../middleware/asyncHandler');
const stripe = require('../config/stripe');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const FreelancerProfile = require('../models/FreelancerProfile');
const sendResponse = require('../utils/apiResponse');

// @desc    Create a PaymentIntent to fund a milestone into escrow
// @route   POST /api/gigs/:gigId/milestones/:milestoneId/payment
// @access  Private (owning client)
const createMilestonePayment = asyncHandler(async (req, res) => {
  const { gigId, milestoneId } = req.params;
  const gig = await Gig.findById(gigId);

  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }
  if (String(gig.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the client who posted this gig can fund its milestones');
  }
  if (!gig.assignedFreelancer) {
    res.status(400);
    throw new Error('This gig has no assigned freelancer yet');
  }

  const milestone = gig.milestones.id(milestoneId);
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found');
  }

  const existingPayment = await Payment.findOne({
    gig: gig._id,
    milestoneId,
    status: { $in: ['pending', 'escrow', 'released'] },
  });
  if (existingPayment) {
    res.status(400);
    throw new Error('This milestone already has a payment in progress or completed');
  }

  if (!stripe) {
    res.status(503);
    throw new Error('Payments are not configured yet. Add STRIPE_SECRET_KEY to backend/.env — see README.');
  }

  // All supported currencies here (USD/EUR/GBP/INR/CAD/AUD) use 2 decimal
  // places, so *100 is correct. A zero-decimal currency (e.g. JPY) would
  // need to skip this multiplication — see Stripe's currency docs if you
  // add one.
  const amountInSmallestUnit = Math.round(milestone.amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: (gig.currency || 'USD').toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: {
      gigId: String(gig._id),
      milestoneId: String(milestoneId),
      clientId: String(req.user._id),
    },
  });

  const payment = await Payment.create({
    gig: gig._id,
    milestoneId,
    client: req.user._id,
    freelancer: gig.assignedFreelancer,
    amount: milestone.amount,
    currency: gig.currency,
    status: 'pending',
    provider: 'stripe',
    providerPaymentId: paymentIntent.id,
    transactionHistory: [{ status: 'pending', note: 'Payment intent created' }],
  });

  sendResponse(res, 201, true, 'Payment intent created', {
    clientSecret: paymentIntent.client_secret,
    payment,
  });
});

// @desc    Re-check a PaymentIntent with Stripe and sync our record
// @route   POST /api/payments/:paymentId/confirm
// @access  Private (paying client)
const confirmMilestonePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  if (String(payment.client) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Only the paying client can confirm this payment');
  }
  if (payment.status !== 'pending') {
    return sendResponse(res, 200, true, 'Payment already synced', { payment });
  }
  if (!stripe) {
    res.status(503);
    throw new Error('Payments are not configured yet.');
  }

  // Never trust the client's word that a payment succeeded — always
  // re-verify the PaymentIntent status directly with Stripe first.
  const intent = await stripe.paymentIntents.retrieve(payment.providerPaymentId);

  if (intent.status === 'succeeded') {
    payment.status = 'escrow';
    payment.transactionHistory.push({ status: 'escrow', note: 'Funds confirmed by Stripe and held in escrow' });
    await payment.save();
  } else if (intent.status === 'canceled') {
    payment.status = 'failed';
    payment.transactionHistory.push({ status: 'failed', note: 'Stripe reported the payment as canceled' });
    await payment.save();
  }
  // Any other Stripe status (e.g. still processing) — leave as "pending"
  // and let the frontend retry the confirm call; nothing to sync yet.

  sendResponse(res, 200, true, 'Payment status synced', { payment });
});

// @desc    List payments on a gig
// @route   GET /api/gigs/:gigId/payments
// @access  Private (the gig's client or assigned freelancer)
const getPaymentsForGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  const isClient = String(gig.client) === String(req.user._id);
  const isFreelancer = gig.assignedFreelancer && String(gig.assignedFreelancer) === String(req.user._id);
  if (!isClient && !isFreelancer) {
    res.status(403);
    throw new Error('You are not part of this gig');
  }

  const payments = await Payment.find({ gig: gig._id }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, 'Payments fetched', { payments });
});

// @desc    Start (or resume) Stripe Connect onboarding so a freelancer can receive payouts
// @route   POST /api/payments/connect/onboard
// @access  Private (freelancer)
const startConnectOnboarding = asyncHandler(async (req, res) => {
  if (!stripe) {
    res.status(503);
    throw new Error('Payments are not configured yet. Add STRIPE_SECRET_KEY to backend/.env — see README.');
  }

  const profile = await FreelancerProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Complete your profile first');
  }

  let accountId = profile.stripeAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: req.user.email,
      capabilities: {
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    profile.stripeAccountId = accountId;
    await profile.save();
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.CLIENT_URL}/dashboard/profile?connect=refresh`,
    return_url: `${process.env.CLIENT_URL}/dashboard/profile?connect=return`,
    type: 'account_onboarding',
  });

  sendResponse(res, 200, true, 'Onboarding link created', { url: accountLink.url });
});

// @desc    Check whether the freelancer's connected account can currently receive payouts
// @route   GET /api/payments/connect/status
// @access  Private (freelancer)
const getConnectStatus = asyncHandler(async (req, res) => {
  const profile = await FreelancerProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error('Profile not found for this account');
  }

  if (!profile.stripeAccountId) {
    return sendResponse(res, 200, true, 'Not connected', { connected: false, payoutsEnabled: false });
  }

  if (!stripe) {
    return sendResponse(res, 200, true, 'Payments not configured', { connected: true, payoutsEnabled: false });
  }

  const account = await stripe.accounts.retrieve(profile.stripeAccountId);
  profile.payoutsEnabled = Boolean(account.payouts_enabled);
  await profile.save();

  sendResponse(res, 200, true, 'Connect status fetched', {
    connected: true,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
});

module.exports = {
  createMilestonePayment,
  confirmMilestonePayment,
  getPaymentsForGig,
  startConnectOnboarding,
  getConnectStatus,
};

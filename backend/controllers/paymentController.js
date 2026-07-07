const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const User = require('../models/User');

const PLATFORM_FEE_PERCENTAGE = 0.10; 
const fundMilestoneEscrow = async (req, res) => {
  const { gigId, milestoneId } = req.body;

  try {
    const gig = await Gig.findById(gigId).populate('selectedFreelancer');
    if (!gig || gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to fund this gig' });
    }

    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'pending') {
      return res.status(400).json({ message: 'Milestone is already funded or completed' });
    }

    const grossAmount = milestone.amount;
    const platformFee = Math.round(grossAmount * PLATFORM_FEE_PERCENTAGE);
    const netFreelancerAmount = grossAmount - platformFee;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(grossAmount * 100),
      currency: 'inr',
      metadata: {
        gigId: gig._id.toString(),
        milestoneId: milestone._id.toString(),
        clientId: req.user._id.toString(),
        freelancerId: gig.selectedFreelancer._id.toString(),
      },
    });

    const payment = await Payment.create({
      gig: gig._id,
      client: req.user._id,
      freelancer: gig.selectedFreelancer._id,
      milestoneId: milestone._id,
      milestoneTitle: milestone.title,
      grossAmount,
      platformFee,
      netFreelancerAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEscrowPayment = async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment verification failed. Intent not succeeded.' });
    }

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'held_in_escrow') {
      return res.status(200).json({ message: 'Escrow already verified', payment });
    }

    payment.status = 'held_in_escrow';
    await payment.save();

    const gig = await Gig.findById(payment.gig);
    const milestone = gig.milestones.id(payment.milestoneId);
    if (milestone) {
      milestone.status = 'in_progress';
      await gig.save();
    }

    res.status(200).json({ message: 'Funds secured in Escrow. Freelancer notified!', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const releaseMilestonePayout = async (req, res) => {
  const { paymentId } = req.body;

  try {
    const payment = await Payment.findById(paymentId).populate('freelancer');
    if (!payment || payment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to release these funds' });
    }

    if (payment.status !== 'held_in_escrow') {
      return res.status(400).json({ message: 'Funds are not currently held in escrow' });
    }

    const freelancer = payment.freelancer;

    let transferId = 'simulated_transfer_test_mode';
    if (freelancer.stripeAccountId) {
      const transfer = await stripe.transfers.create({
        amount: Math.round(payment.netFreelancerAmount * 100),
        currency: 'inr',
        destination: freelancer.stripeAccountId,
        transfer_group: `GIG_${payment.gig.toString()}`,
      });
      transferId = transfer.id;
    }
    
    if (payment.isDisputed) {
      return res.status(403).json({
      message: 'Action blocked. This payment is currently frozen under an active dispute investigation.',
      });
    }

    payment.status = 'released';
    payment.stripeTransferId = transferId;
    await payment.save();

    const gig = await Gig.findById(payment.gig);
    const milestone = gig.milestones.id(payment.milestoneId);
    if (milestone) {
      milestone.status = 'paid';
      await gig.save();
    }
    
    res.status(200).json({ message: 'Milestone approved and payout released!', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refundEscrow = async (req, res) => {
  const { paymentId } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.status !== 'held_in_escrow') {
      return res.status(400).json({ message: 'Invalid payment or funds not in escrow' });
    }

    await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
    });

    if (payment.isDisputed) {
      return res.status(403).json({
      message: 'Action blocked. This payment is currently frozen under an active dispute investigation.',
      });
    }

    payment.status = 'refunded';
    await payment.save();

    res.status(200).json({ message: 'Escrow refunded successfully back to client.', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await Payment.find({
      $or: [{ client: userId }, { freelancer: userId }],
    })
      .populate('gig', 'title')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  fundMilestoneEscrow,
  verifyEscrowPayment,
  releaseMilestonePayout,
  refundEscrow,
  getTransactionHistory,
};
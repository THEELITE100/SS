require('dotenv').config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_please_replace_in_env';
const stripe = require('stripe')(stripeSecretKey);

exports.createEscrowSession = async (req, res) => {
  try {
    if (stripeSecretKey.includes('dummy_key')) {
      return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' });
    }

    const { gigTitle, milestoneAmount, gigId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: `Escrow: Stage 1 for ${gigTitle}` },
            unit_amount: milestoneAmount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'manual',
        metadata: { gigId, type: 'escrow_lock' }
      },
      success_url: `${process.env.FRONTEND_URL}/gigs/${gigId}?escrow=success`,
      cancel_url: `${process.env.FRONTEND_URL}/gigs/${gigId}?escrow=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Escrow Error:', error);
    res.status(500).json({ error: 'Failed to initialize escrow session.' });
  }
};

exports.releaseMilestonePayout = async (req, res) => {
  try {
    if (stripeSecretKey.includes('dummy_key')) {
      return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env' });
    }

    const { paymentIntentId, freelancerStripeAccountId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: 'inr',
      destination: freelancerStripeAccountId,
      transfer_group: paymentIntentId,
    });

    res.status(200).json({ message: 'Funds successfully released from escrow.', transferId: transfer.id });
  } catch (error) {
    console.error('Stripe Payout Error:', error);
    res.status(500).json({ error: 'Failed to authorize escrow release.' });
  }
};
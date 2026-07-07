const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const AdminLog = require('../models/AdminLog');
const { sendNotification } = require('../services/notificationService');

const createDispute = async (req, res) => {
  const { gigId, paymentId, reason, description, initialEvidence = [] } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status !== 'held_in_escrow') {
      return res.status(400).json({ message: 'Disputes can only be filed on active escrow payments' });
    }

    if (payment.isDisputed) {
      return res.status(409).json({ message: 'A dispute is already active for this milestone' });
    }

    const gig = await Gig.findById(gigId);
    const isClient = payment.client.toString() === req.user._id.toString();
    const isFreelancer = payment.freelancer.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ message: 'Not authorized to initiate a dispute on this transaction' });
    }

    const respondentId = isClient ? payment.freelancer : payment.client;

    payment.isDisputed = true;
    await payment.save();

    const formattedEvidence = initialEvidence.map((doc) => ({
      uploader: req.user._id,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
    }));

    const dispute = await Dispute.create({
      gig: gigId,
      payment: paymentId,
      initiator: req.user._id,
      respondent: respondentId,
      reason,
      description,
      evidence: formattedEvidence,
    });

    await sendNotification({
      recipient: respondentId,
      sender: req.user._id,
      type: 'DISPUTE_OPENED',
      title: '⚠️ Dispute Filed on Milestone',
      message: `${req.user.name} initiated a dispute regarding "${gig.title}". Escrow funds have been frozen.`,
      link: `/dashboard/disputes/${dispute._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Dispute filed successfully. Escrow funds frozen pending mediation.',
      dispute,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitEvidence = async (req, res) => {
  const { fileName, fileUrl } = req.body;

  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (dispute.status.startsWith('resolved')) {
      return res.status(400).json({ message: 'Cannot submit evidence to a closed dispute' });
    }

    const isParticipant =
      dispute.initiator.toString() === req.user._id.toString() ||
      dispute.respondent.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Only dispute participants can submit evidence' });
    }

    dispute.evidence.push({
      uploader: req.user._id,
      fileName,
      fileUrl,
    });

    await dispute.save();
    res.status(200).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDisputes = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { $or: [{ initiator: req.user._id }, { respondent: req.user._id }] };

    const disputes = await Dispute.find(query)
      .populate('gig', 'title category')
      .populate('payment', 'grossAmount netFreelancerAmount status')
      .populate('initiator', 'name email')
      .populate('respondent', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveDispute = async (req, res) => {
  const { verdict, adminNotes, clientPercentage = 0 } = req.body;

  try {
    const dispute = await Dispute.findById(req.params.id).populate({
      path: 'payment',
      populate: { path: 'freelancer' },
    });

    if (!dispute || dispute.status.startsWith('resolved')) {
      return res.status(400).json({ message: 'Dispute is invalid or already resolved' });
    }

    const payment = dispute.payment;
    const grossAmount = payment.grossAmount;
    let clientRefundAmount = 0;
    let freelancerPayoutAmount = 0;
    let newStatus = '';

    if (verdict === 'FAVOR_CLIENT') {
      clientRefundAmount = grossAmount;
      newStatus = 'resolved_client';
      await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
      payment.status = 'refunded';
    } else if (verdict === 'FAVOR_FREELANCER') {
      freelancerPayoutAmount = payment.netFreelancerAmount;
      newStatus = 'resolved_freelancer';
      if (payment.freelancer.stripeAccountId) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(freelancerPayoutAmount * 100),
          currency: 'inr',
          destination: payment.freelancer.stripeAccountId,
          transfer_group: `DISPUTE_${dispute._id}`,
        });
        payment.stripeTransferId = transfer.id;
      }
      payment.status = 'released';
    } else if (verdict === 'SPLIT') {
      clientRefundAmount = Math.round(grossAmount * (Number(clientPercentage) / 100));
      freelancerPayoutAmount = grossAmount - clientRefundAmount;
      newStatus = 'resolved_split';

      if (clientRefundAmount > 0) {
        await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(clientRefundAmount * 100),
        });
      }
      if (freelancerPayoutAmount > 0 && payment.freelancer.stripeAccountId) {
        await stripe.transfers.create({
          amount: Math.round(freelancerPayoutAmount * 100),
          currency: 'inr',
          destination: payment.freelancer.stripeAccountId,
        });
      }
      payment.status = 'released';
    } else {
      return res.status(400).json({ message: 'Invalid verdict provided' });
    }

    payment.isDisputed = false;
    await payment.save();

    dispute.status = newStatus;
    dispute.assignedAdmin = req.user._id;
    dispute.adminNotes = adminNotes || `Verdict rendered: ${verdict}`;
    dispute.resolutionDetails = {
      clientRefundAmount,
      freelancerPayoutAmount,
      resolvedAt: new Date(),
    };
    await dispute.save();

    await AdminLog.create({
      admin: req.user._id,
      action: 'RESOLVE_DISPUTE',
      targetId: dispute._id,
      targetType: 'Dispute',
      details: `Verdict: ${verdict} | Client: ₹${clientRefundAmount} | Freelancer: ₹${freelancerPayoutAmount}`,
    });

    const alertTitle = '⚖️ Dispute Resolved by Administration';
    const alertMessage = `The dispute has been resolved. Verdict: ${verdict.replace('_', ' ')}. Check dispute details for financial breakdown.`;
    
    await sendNotification({ recipient: dispute.initiator, type: 'SYSTEM_ALERT', title: alertTitle, message: alertMessage, link: `/dashboard/disputes/${dispute._id}` });
    await sendNotification({ recipient: dispute.respondent, type: 'SYSTEM_ALERT', title: alertTitle, message: alertMessage, link: `/dashboard/disputes/${dispute._id}` });

    res.status(200).json({ success: true, message: 'Dispute resolved and escrow funds disbursed successfully.', dispute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDispute, submitEvidence, getDisputes, resolveDispute };
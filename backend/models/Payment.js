const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    milestoneTitle: {
      type: String,
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    netFreelancerAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'inr',
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeTransferId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'held_in_escrow', 'released', 'refunded', 'failed'],
      default: 'pending',
    },
    isDisputed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    milestoneId: { type: mongoose.Schema.Types.ObjectId, default: null },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'escrow', 'released', 'refunded', 'failed'],
      default: 'pending',
    },
    provider: { type: String, enum: ['stripe', 'razorpay'], default: 'stripe' },
    providerPaymentId: { type: String, default: '' },
    providerOrderId: { type: String, default: '' },
    escrowReleaseDate: { type: Date },
    transactionHistory: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

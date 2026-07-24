const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
    milestoneId: { type: mongoose.Schema.Types.ObjectId, default: null },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true, maxlength: 3000 },
    evidence: [
      {
        url: String,
        name: String,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'rejected'],
      default: 'open',
    },
    resolution: { type: String, default: '' },
    outcome: {
      type: String,
      enum: ['pay_freelancer', 'refund_client', 'no_action', null],
      default: null,
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    messages: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);

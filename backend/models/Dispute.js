const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'POOR_QUALITY',
        'MISSED_DEADLINE',
        'UNRESPONSIVE',
        'SCOPE_CREEP',
        'PAYMENT_ISSUE',
        'OTHER',
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed explanation of the issue'],
      maxlength: 2000,
    },
    evidence: [
      {
        uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fileName: { type: String },
        fileUrl: { type: String }, // Cloudinary URL
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved_client', 'resolved_freelancer', 'resolved_split'],
      default: 'open',
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    resolutionDetails: {
      clientRefundAmount: { type: Number, default: 0 },
      freelancerPayoutAmount: { type: Number, default: 0 },
      resolvedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
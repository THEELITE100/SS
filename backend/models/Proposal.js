const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Please provide a proposal pitch'],
    },
    bidAmount: {
      type: Number,
      required: [true, 'Please specify your bid amount'],
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Please estimate completion time in days'],
    },
    proposedMilestones: [
      {
        title: { type: String },
        amount: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'under_negotiation', 'accepted', 'rejected', 'withdrawn'],
      default: 'submitted',
    },
    negotiationHistory: [
      {
        sender: { type: String, enum: ['client', 'freelancer'] },
        proposedAmount: { type: Number },
        proposedDays: { type: Number },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

proposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
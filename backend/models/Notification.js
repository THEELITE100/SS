const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'NEW_PROPOSAL',
        'PROPOSAL_ACCEPTED',
        'PROPOSAL_COUNTERED',
        'ESCROW_FUNDED',
        'PAYOUT_RELEASED',
        'REVIEW_ADDED',
        'DISPUTE_OPENED',
        'SYSTEM_ALERT',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, 
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
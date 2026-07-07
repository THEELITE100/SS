const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
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
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Please provide a meeting subject'],
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    meetingUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ freelancer: 1, startTime: 1 }, { unique: false });

module.exports = mongoose.model('Booking', bookingSchema);
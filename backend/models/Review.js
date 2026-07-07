const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metrics: {
      quality: { type: Number, required: true, min: 1, max: 5 },
      communication: { type: Number, required: true, min: 1, max: 5 },
      timeliness: { type: Number, required: true, min: 1, max: 5 },
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide written feedback'],
      maxlength: 1000,
    },
    projectValue: {
      type: Number,
      required: true,
    },
    isVerifiedWork: {
      type: Boolean,
      default: true,
    },
    isFlaggedForFraud: {
      type: Boolean,
      default: false,
    },
    fraudReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ gig: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
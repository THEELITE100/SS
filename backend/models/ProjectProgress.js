const mongoose = require('mongoose');

const projectProgressSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
      unique: true,
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
    overallPercentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    tasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
        milestoneRef: { type: mongoose.Schema.Types.ObjectId }, 
      },
    ],
    progressLogs: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        percentageReported: { type: Number, required: true },
        attachments: [
          {
            fileName: { type: String },
            fileUrl: { type: String },
          },
        ],
        timestamp: { type: Date, default: Date.now },
      },
    ],
    nextDeadline: {
      type: Date,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectProgress', projectProgressSchema);
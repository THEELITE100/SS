const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a gig title'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Please describe the project details'],
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    requiredSkills: [
      {
        type: String,
        required: true,
      },
    ],
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
    budgetRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    milestones: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'paid'],
          default: 'pending',
        },
      },
    ],
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
      },
    ],
    locationRequirement: {
      type: String,
      enum: ['remote', 'hyperlocal'],
      default: 'remote',
    },
    targetCoordinates: {
      type: [Number], 
      index: '2dsphere',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    selectedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gig', gigSchema);
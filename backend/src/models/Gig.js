const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'paid'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const gigSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },
    category: { type: String, required: true },
    skillsRequired: [{ type: String, trim: true }],
    budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    milestones: [milestoneSchema],
    attachments: [
      {
        url: String,
        name: String,
        publicId: String,
      },
    ],
    location: {
      city: { type: String, default: '' },
      isRemote: { type: Boolean, default: true },
      coordinates: { type: [Number], default: undefined },
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
    },
    invitedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    applicationsCount: { type: Number, default: 0 },
    deadline: { type: Date },
  },
  { timestamps: true }
);

gigSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
gigSchema.index({ 'location.coordinates': '2dsphere' });
gigSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Gig', gigSchema);

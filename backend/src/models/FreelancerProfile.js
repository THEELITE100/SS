const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: { type: String, trim: true, maxlength: 150, default: '' },
    bio: { type: String, maxlength: 2000, default: '' },
    skills: [
      {
        name: { type: String, required: true, trim: true },
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'expert'],
          default: 'intermediate',
        },
      },
    ],
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        projectUrl: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      uploadedAt: { type: Date },
    },
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, default: '' },
        issueDate: { type: Date },
        credentialUrl: { type: String, default: '' },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, default: '' },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
    availability: {
      status: {
        type: String,
        enum: ['available', 'busy', 'unavailable'],
        default: 'available',
      },
      slots: [
        {
          day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          startTime: String, // "09:00"
          endTime: String, // "17:00"
        },
      ],
    },
    pricing: {
      hourlyRate: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    verificationBadge: {
      type: String,
      enum: ['none', 'verified', 'top_rated'],
      default: 'none',
    },
    reputationScore: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    completedGigs: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: '' },
    payoutsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

freelancerProfileSchema.index({ 'skills.name': 1 });
freelancerProfileSchema.index({ reputationScore: -1 });

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);

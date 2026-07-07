const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: [true, 'Please add a bio outlining your expertise'],
      maxlength: 1000,
    },
    skills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Expert'],
          default: 'Intermediate',
        },
      },
    ],
    hourlyRate: {
      type: Number,
      required: true,
    },
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        projectUrl: { type: String },
      },
    ],
    resumeUrl: {
      type: String,
    },
    certifications: [
      {
        title: { type: String },
        issuer: { type: String },
        issueDate: { type: Date },
      },
    ],
    reputationScore: {
      type: Number,
      default: 5.0, 
    },
    completedGigsCount: {
      type: Number,
      default: 0,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);
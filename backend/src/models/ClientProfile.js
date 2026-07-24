const mongoose = require('mongoose');

const clientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, trim: true, default: '' },
    about: { type: String, maxlength: 2000, default: '' },
    industry: { type: String, default: '' },
    totalSpent: { type: Number, default: 0 },
    gigsPosted: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientProfile', clientProfileSchema);

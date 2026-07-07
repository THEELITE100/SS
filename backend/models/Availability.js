const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    weeklySchedule: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    blockedDates: [
      {
        type: Date,
      },
    ],
    slotDurationMinutes: {
      type: Number,
      default: 30, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
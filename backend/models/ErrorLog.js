const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    statusCode: {
      type: Number,
      default: 500,
    },
    route: {
      type: String,
    },
    method: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ip: {
      type: String,
    },
    bodyPayload: {
      type: Object, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ErrorLog', errorLogSchema);
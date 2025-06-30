const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      default: 'passenger',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Passenger', passengerSchema);

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
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
    name: {
      type: String,
      trim: true,
    },
    cnic: {
      type: String,
      trim: true,
    },
    profileImage: String,
    vehicle: {
      type: {
        type: String,
        enum: ['car', 'bike', 'auto', 'ac', 'tourbus'],
      },
      brand: String,
      name: String,
      modelYear: Number,
      numberPlate: {
        type: String,
        trim: true,
      },
      color: String,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['offline', 'online', 'on_trip'],
      default: 'offline',
    },
    userType: {
      type: String,
      default: 'driver',
    },
  },
  { timestamps: true },
);

driverSchema.index({ cnic: 1 }, { unique: true, sparse: true });
driverSchema.index(
  { 'vehicle.numberPlate': 1 },
  { unique: true, sparse: true },
);
driverSchema.index({ status: 1 });

module.exports = mongoose.model('Driver', driverSchema);

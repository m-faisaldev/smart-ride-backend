const mongoose = require('mongoose');

const offeredRideSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true,
    index: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true,
  },
  driverOfferedAmount: {
    type: Number,
    required: true,
  },
  offeredAt: {
    type: Date,
    default: Date.now,
  },
});

offeredRideSchema.index({ rideId: 1, driverId: 1 }, { unique: true });

module.exports = mongoose.model('OfferedRide', offeredRideSchema);

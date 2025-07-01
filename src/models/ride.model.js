const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger',
    required: true,
    index: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: false,
    index: true,
  },
  pickUpLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  dropOffLocations: [
    {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  ],
  vehicleType: {
    type: String,
    required: true,
    enum: ['mini car', 'ac car', 'bike', 'auto', 'tourbus'],
  },
  fareAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  fareAmountDriver: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'offered',
      'rejected',
      'arrived',
      'started',
      'completed',
      'cancelled',
      'expired',
    ],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    // default: () => new Date(Date.now() + 10 * 60 * 1000),
    default: () => new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
  },
  review: {
    rating: Number,
    comment: String,
    reviewedAt: Date,
  },
  passengerConfirmation: {
    type: String, // "coming"
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupChat',
    default: null,
  },
  isGroupRide: {
    type: Boolean,
    default: false,
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger',
    default: null,
  },
});

rideSchema.index({ pickUpLocation: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);

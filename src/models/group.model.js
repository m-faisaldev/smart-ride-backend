const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    tripDetails: {
      date: {
        type: Date,
        required: [true, 'Trip date is required'],
      },
      time: {
        type: String,
        required: [true, 'Trip time is required'],
      },
      venue: {
        type: String,
        required: [true, 'Venue is required'],
      },
      days: {
        type: Number,
        required: [true, 'Number of days is required'],
      },
      description: {
        type: String,
        required: [true, 'Trip description is required'],
      },
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger',
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Passenger',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('GroupChat', groupChatSchema);

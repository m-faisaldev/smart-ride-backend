const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    senderRole: {
      type: String,
      enum: ['driver', 'passenger'],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

messageSchema.index({ rideId: 1, sentAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });

messageSchema.statics.getByRideId = function (rideId) {
  return this.find({ rideId })
    .populate('senderId', 'name username email')
    .populate('receiverId', 'name username email')
    .sort({ sentAt: 1 });
};

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;

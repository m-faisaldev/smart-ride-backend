const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ['driver', 'passenger'],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    },
  },
  { timestamps: true },
);

verificationTokenSchema.index({ phoneNumber: 1, userType: 1 });
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);

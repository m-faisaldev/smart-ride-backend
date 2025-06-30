// const { client, messagingServiceSid } = require('../config/twillio.config');
// const crypto = require('crypto');

// Generate a 4-digit random OTP as a string
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Commented out hashing and comparison logic
// const hashOtp = (otp) => {
//   return crypto.createHash('sha256').update(otp).digest('hex');
// };
//
// const compareOtp = (otp, hash) => {
//   const hashed = hashOtp(otp);
//   return hashed === hash;
// };

// Commented out Twilio sendOtp
// const sendOtp = async (phoneNumber, otp) => {
//   try {
//     await client.messages.create({
//       to: phoneNumber,
//       body: `Your OTP is ${otp}`,
//       messagingServiceSid,
//     });
//
//     return {
//       success: true,
//       message: 'OTP sent successfully',
//     };
//   } catch (err) {
//     console.error('Twilio sendOtp error:', err);
//     throw new Error('Failed to send OTP');
//   }
// };

const compareOtp = (otp, plain) => otp === plain;

module.exports = {
  generateOtp,
  compareOtp,
};

const jwt = require('jsonwebtoken');
const Passenger = require('../../models/passenger.model');
const Verification = require('../../models/verification.model');
const { hashPassword, comparePassword } = require('../../utils/auth');
const AppError = require('../../utils/AppError');
const {
  generateOtp,
  // hashOtp,
  compareOtp,
  // sendOtp,
} = require('../../services/otp.service');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userType: 'passenger',
      phoneNumber: user.phoneNumber,
      name: user.name,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

const generateContextToken = (phoneNumber) => {
  const payload = { phoneNumber };
  const secret = process.env.JWT_SECRET;

  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
};

const sendCodeForRegister = async (phoneNumber) => {
  const existing = await Passenger.findOne({ phoneNumber });
  if (existing) throw new AppError('Passenger already exists', 400);

  await Verification.deleteMany({ phoneNumber, userType: 'passenger' });
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Verification.create({
    phoneNumber,
    code,
    userType: 'passenger',
    expiresAt,
  });

  const contextToken = generateContextToken(phoneNumber);
  return {
    phoneNumber,
    expiresAt,
    sent: true,
    contextToken,
  };
};

const verifyCodeForRegister = async (phoneNumber, code) => {
  const record = await Verification.findOne({
    phoneNumber,
    userType: 'passenger',
    expiresAt: { $gt: new Date() },
  });
  if (!record) throw new AppError('Invalid or expired code', 400);
  if (!compareOtp(code, record.code)) {
    throw new AppError('Invalid or expired code', 400);
  }
  record.verified = true;
  await record.save();

  const contextToken = generateContextToken(phoneNumber);
  return { phoneNumber, verified: true, contextToken };
};

const setPasswordForRegister = async (
  phoneNumber,
  password,
  confirmPassword,
  additionalData = {},
) => {
  if (password !== confirmPassword)
    throw new AppError('Passwords do not match', 400);
  const verification = await Verification.findOne({
    phoneNumber,
    userType: 'passenger',
    verified: true,
  });
  if (!verification) throw new AppError('Phone number not verified', 400);
  let existing = await Passenger.findOne({ phoneNumber });
  if (existing) throw new AppError('Passenger already exists', 400);
  const hashed = await hashPassword(password);
  const passenger = await Passenger.create({
    phoneNumber,
    password: hashed,
    userType: 'passenger',
    isVerified: true,
    ...additionalData,
  });
  await Verification.deleteMany({ phoneNumber, userType: 'passenger' });
  return { passenger, token: generateToken(passenger) };
};

const sendCodeForForgotPassword = async (phoneNumber) => {
  const passenger = await Passenger.findOne({ phoneNumber });
  if (!passenger) throw new AppError('Passenger not found', 404);

  await Verification.deleteMany({ phoneNumber, userType: 'passenger' });
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Verification.create({
    phoneNumber,
    code,
    userType: 'passenger',
    expiresAt,
  });

  const contextToken = generateContextToken(phoneNumber);
  return {
    phoneNumber,
    expiresAt,
    sent: true,
    contextToken,
  };
};

const verifyCodeForForgotPassword = async (phoneNumber, code) => {
  const record = await Verification.findOne({
    phoneNumber,
    userType: 'passenger',
    expiresAt: { $gt: new Date() },
  });
  if (!record) throw new AppError('Invalid or expired code', 400);
  if (!compareOtp(code, record.code)) {
    throw new AppError('Invalid or expired code', 400);
  }
  record.verified = true;
  await record.save();

  const contextToken = generateContextToken(phoneNumber);
  return { phoneNumber, verified: true, contextToken };
};

const resetPasswordWithContextToken = async (
  phoneNumber,
  password,
  confirmPassword,
) => {
  if (password !== confirmPassword)
    throw new AppError('Passwords do not match', 400);

  const verification = await Verification.findOne({
    phoneNumber,
    userType: 'passenger',
    verified: true,
  });
  if (!verification) throw new AppError('Phone number not verified', 400);

  const passenger = await Passenger.findOne({ phoneNumber });
  if (!passenger) throw new AppError('Passenger not found', 404);

  passenger.password = await hashPassword(password);
  await passenger.save();
  await Verification.deleteMany({ phoneNumber, userType: 'passenger' });
  return true;
};

const login = async (phoneNumber, password) => {
  const passenger = await Passenger.findOne({ phoneNumber }).select(
    '+password',
  );
  if (!passenger) throw new AppError('Passenger not found', 404);
  const match = await comparePassword(password, passenger.password);
  if (!match) throw new AppError('Invalid credentials', 401);
  return { passenger, token: generateToken(passenger) };
};

const logout = async (userId) => {
  return { success: true };
};

const deleteAccount = async (userId) => {
  await Passenger.findByIdAndDelete(userId);
  return { success: true };
};

module.exports = {
  sendCodeForRegister,
  verifyCodeForRegister,
  setPasswordForRegister,
  sendCodeForForgotPassword,
  verifyCodeForForgotPassword,
  resetPasswordWithContextToken,
  login,
  logout,
  deleteAccount,
  generateToken,
  generateContextToken,
};

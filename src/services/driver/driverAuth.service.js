const jwt = require('jsonwebtoken');
const Driver = require('../../models/driver.model');
const Verification = require('../../models/verification.model');
const { hashPassword, comparePassword } = require('../../utils/auth');
const AppError = require('../../utils/AppError');
const { generateOtp, compareOtp } = require('../../services/otp.service');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      userType: 'driver',
      phoneNumber: user.phoneNumber,
      name: user.name,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

const sendVerificationCode = async (phoneNumber) => {
  await Verification.deleteMany({ phoneNumber, userType: 'driver' });
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Verification.create({
    phoneNumber,
    code,
    userType: 'driver',
    expiresAt,
  });
  return {
    phoneNumber,
    expiresAt,
    sent: true,
  };
};

const verifyCodeOnly = async (phoneNumber, code) => {
  const record = await Verification.findOne({
    phoneNumber,
    userType: 'driver',
    expiresAt: { $gt: new Date() },
  });
  if (!record) throw new AppError('Invalid or expired code', 400);
  if (!compareOtp(code, record.code))
    throw new AppError('Invalid or expired code', 400);
  record.verified = true;
  await record.save();
  return { phoneNumber, verified: true };
};

const createAccountWithPassword = async (
  phoneNumber,
  password,
  confirmPassword,
  additionalData = {},
) => {
  if (password !== confirmPassword)
    throw new AppError('Passwords do not match', 400);
  const verification = await Verification.findOne({
    phoneNumber,
    userType: 'driver',
    verified: true,
  });
  if (!verification) throw new AppError('Phone number not verified', 400);
  let existing = await Driver.findOne({ phoneNumber });
  if (existing) throw new AppError('Driver already exists', 400);
  const hashed = await hashPassword(password);
  const driver = await Driver.create({
    phoneNumber,
    password: hashed,
    userType: 'driver',
    isVerified: true,
    ...additionalData,
  });
  await Verification.deleteMany({ phoneNumber, userType: 'driver' });
  return { driver, token: generateToken(driver) };
};

const createAccountWithToken = async (
  phoneNumber,
  password,
  confirmPassword,
  additionalData = {},
) => {
  if (password !== confirmPassword)
    throw new AppError('Passwords do not match', 400);
  let existing = await Driver.findOne({ phoneNumber });
  if (existing) throw new AppError('Driver already exists', 400);
  const hashed = await hashPassword(password);
  const driver = await Driver.create({
    phoneNumber,
    password: hashed,
    userType: 'driver',
    isVerified: true,
    ...additionalData,
  });
  return { driver, token: generateToken(driver) };
};

const login = async (phoneNumber, password) => {
  const driver = await Driver.findOne({ phoneNumber }).select('+password');
  if (!driver) throw new AppError('Driver not found', 404);
  const match = await comparePassword(password, driver.password);
  if (!match) throw new AppError('Invalid credentials', 401);
  return { driver, token: generateToken(driver) };
};

const logout = async (userId) => {
  return { success: true };
};

const deleteAccount = async (userId) => {
  await Driver.findByIdAndDelete(userId);
  return { success: true };
};

const resetPasswordWithOtp = async (
  phoneNumber,
  code,
  password,
  confirmPassword,
) => {
  if (password !== confirmPassword)
    throw new AppError('Passwords do not match', 400);
  const record = await Verification.findOne({
    phoneNumber,
    userType: 'driver',
    expiresAt: { $gt: new Date() },
    code,
  });
  if (!record) throw new AppError('Invalid or expired code', 400);
  const driver = await Driver.findOne({ phoneNumber });
  if (!driver) throw new AppError('Driver not found', 404);
  driver.password = await hashPassword(password);
  await driver.save();
  await Verification.deleteMany({ phoneNumber, userType: 'driver' });
  return true;
};

const resetPasswordWithToken = async (
  phoneNumber,
  password,
  confirmPassword,
) => {
  if (password !== confirmPassword)
    throw new AppError('Passwords do not match', 400);
  const driver = await Driver.findOne({ phoneNumber });
  if (!driver) throw new AppError('Driver not found', 404);
  driver.password = await hashPassword(password);
  await driver.save();
  return true;
};

module.exports = {
  sendVerificationCode,
  verifyCodeOnly,
  createAccountWithPassword,
  createAccountWithToken,
  login,
  logout,
  deleteAccount,
  generateToken,
  resetPasswordWithOtp,
  resetPasswordWithToken,
};

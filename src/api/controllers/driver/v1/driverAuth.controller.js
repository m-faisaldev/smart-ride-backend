const { StatusCodes } = require('http-status-codes');
const driverAuthService = require('../../../../services/driver/driverAuth.service');
const Verification = require('../../../../models/verification.model');

const driverAuthController = {
  register: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Phone number is required',
        });
      }
      const result = await driverAuthService.sendVerificationCode(phoneNumber);
      const jwt = require('jsonwebtoken');
      const phoneContextToken = jwt.sign(
        { phoneNumber },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '1m' },
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'OTP sent for registration',
        phoneContextToken,
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  },

  verifyReset: async (req, res) => {
    try {
      const { code } = req.body;
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'No phone context token provided',
        });
      }
      const phoneContextToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          phoneContextToken,
          process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired phone context token',
        });
      }
      if (!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Code is required',
        });
      }
      const verified = await driverAuthService.verifyCodeOnly(
        phoneNumber,
        code,
      );
      if (!verified) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Invalid or expired code',
        });
      }
      const jwt = require('jsonwebtoken');
      const resetToken = jwt.sign(
        { phoneNumber },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '10m' },
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'OTP verified. Use this token to set password.',
        resetToken,
      });
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  },

  resetPasswordWithToken: async (req, res) => {
    try {
      const { password, confirmPassword } = req.body;
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'No reset token provided',
        });
      }
      const resetToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          resetToken,
          process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }
      if (!phoneNumber) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
      if (!password || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Password and confirmPassword are required',
        });
      }
      const verifiedRecord = await Verification.findOne({
        phoneNumber,
        userType: 'driver',
        verified: true,
      });
      if (!verifiedRecord) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message:
            'OTP not verified. Please verify OTP before setting password.',
        });
      }
      const result = await driverAuthService.createAccountWithToken(
        phoneNumber,
        password,
        confirmPassword,
      );
      await Verification.deleteMany({ phoneNumber, userType: 'driver' });
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  },

  sendCode: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'Phone number is required' });
      }
      const result = await driverAuthService.sendVerificationCode(phoneNumber);
      const jwt = require('jsonwebtoken');
      const phoneContextToken = jwt.sign(
        { phoneNumber },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '1m' },
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Verification code sent to driver',
        phoneContextToken,
        data: result,
      });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },

  verifyCode: async (req, res) => {
    try {
      const { code } = req.body;
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'No phone context token provided',
        });
      }
      const phoneContextToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          phoneContextToken,
          process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired phone context token',
        });
      }
      if (!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Code is required',
        });
      }
      const verified = await driverAuthService.verifyCodeOnly(
        phoneNumber,
        code,
      );
      if (!verified) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Invalid or expired code',
        });
      }
      const jwt = require('jsonwebtoken');
      const resetToken = jwt.sign(
        { phoneNumber },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '10m' },
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Phone number verified successfully',
        resetToken,
      });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },

  createAccount: async (req, res) => {
    try {
      const { password, confirmPassword, ...additionalData } = req.body;
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'No reset token provided',
        });
      }
      const resetToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          resetToken,
          process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }
      if (!phoneNumber) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }
      if (!password || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Password and confirmPassword are required',
        });
      }
      const verifiedRecord = await Verification.findOne({
        phoneNumber,
        userType: 'driver',
        verified: true,
      });
      if (!verifiedRecord) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          message:
            'OTP not verified. Please verify OTP before creating account.',
        });
      }
      const result = await driverAuthService.createAccountWithToken(
        phoneNumber,
        password,
        confirmPassword,
        additionalData,
      );
      await Verification.deleteMany({ phoneNumber, userType: 'driver' });
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      if (!phoneNumber || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Phone number and password are required',
        });
      }
      const result = await driverAuthService.login(phoneNumber, password);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: 'Login successful', data: result });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.UNAUTHORIZED)
        .json({ success: false, message: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
      }
      await driverAuthService.logout(userId);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
      }
      await driverAuthService.deleteAccount(userId);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Phone number is required',
        });
      }
      await driverAuthService.sendVerificationCode(phoneNumber);
      const jwt = require('jsonwebtoken');
      const phoneContextToken = jwt.sign(
        { phoneNumber },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '1m' },
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'OTP sent for password reset',
        phoneContextToken,
      });
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = driverAuthController;

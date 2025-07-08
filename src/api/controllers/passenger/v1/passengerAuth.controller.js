const { StatusCodes } = require('http-status-codes');
const Verification = require('../../../../models/verification.model');

const passengerAuthService = require('../../../../services/passenger/passengerAuth.service');

const passengerAuthController = {
  sendCode: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, message: 'Phone number is required' });
      }
      const result =
        await passengerAuthService.sendCodeForRegister(phoneNumber);
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Verification code sent for registration',
        contextToken: result.contextToken,
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
          message: 'No context token provided',
        });
      }
      const contextToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          contextToken,
          process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired context token',
        });
      }

      if (!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Code is required',
        });
      }

      const result = await passengerAuthService.verifyCodeForRegister(
        phoneNumber,
        code,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Phone number verified successfully',
        contextToken: result.contextToken,
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
          message: 'No context token provided',
        });
      }
      const contextToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          contextToken,
          process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired context token',
        });
      }

      if (!password || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Password and confirmPassword are required',
        });
      }

      const result = await passengerAuthService.setPasswordForRegister(
        phoneNumber,
        password,
        confirmPassword,
        additionalData,
      );
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

  forgotPassword: async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Phone number is required',
        });
      }
      const result =
        await passengerAuthService.sendCodeForForgotPassword(phoneNumber);
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'OTP sent for password reset',
        contextToken: result.contextToken,
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
      // Get phone number from Bearer token (contextToken)
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'No context token provided',
        });
      }
      const contextToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          contextToken,
          process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired context token',
        });
      }

      if (!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Code is required',
        });
      }

      const result = await passengerAuthService.verifyCodeForForgotPassword(
        phoneNumber,
        code,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'OTP verified. Use this token to reset password.',
        contextToken: result.contextToken,
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
          message: 'No context token provided',
        });
      }
      const contextToken = authHeader.replace('Bearer ', '');
      let phoneNumber;
      try {
        const decoded = require('jsonwebtoken').verify(
          contextToken,
          process.env.JWT_SECRET,
        );
        phoneNumber = decoded.phoneNumber;
      } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired context token',
        });
      }

      if (!password || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Password and confirmPassword are required',
        });
      }

      await passengerAuthService.resetPasswordWithContextToken(
        phoneNumber,
        password,
        confirmPassword,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
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
      const result = await passengerAuthService.login(phoneNumber, password);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: 'Login successful', data: result });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: 'User not authenticated' });
      }
      await passengerAuthService.logout(userId);
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
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: 'User not authenticated' });
      }
      await passengerAuthService.deleteAccount(userId);
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  },
};

module.exports = passengerAuthController;

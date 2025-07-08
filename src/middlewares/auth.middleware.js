const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      logger.warn('No token, authorization denied');
      return next(new AppError('No token, authorization denied', 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      phoneNumber: decoded.phoneNumber,
      userType: decoded.userType,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      isVerified: decoded.isVerified,
    };
    next();
  } catch (error) {
    logger.error('Token is not valid:', error);
    next(new AppError('Token is not valid', 401));
  }
};

const protectDriverOnly = async (req, res, next) => {
  protect(req, res, (err) => {
    if (err) return next(err);
    if (!req.user) return;
    if (req.user.userType !== 'driver') {
      logger.warn('Access denied. Driver role required.');
      return next(new AppError('Access denied. Driver role required.', 403));
    }
    next();
  });
};

const protectPassengerOnly = async (req, res, next) => {
  protect(req, res, (err) => {
    if (err) return next(err);
    if (!req.user) return;
    if (req.user.userType !== 'passenger') {
      logger.warn('Access denied. Passenger role required.');
      return next(new AppError('Access denied. Passenger role required.', 403));
    }
    next();
  });
};

module.exports = { protect, protectDriverOnly, protectPassengerOnly };

const Driver = require('../models/driver.model');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const requireCompleteOnboarding = async (req, res, next) => {
  try {
    if (req.user.userType !== 'driver') return next();

    const driver = await Driver.findById(req.user.id);
    if (!driver) {
      logger.warn('Onboarding check: Driver not found', req.user.id);
      return next(new AppError('Driver not found', 404));
    }

    const missing = [];

    if (!driver.name || !driver.cnic) {
      missing.push('Name and CNIC');
    }

    if (!driver.profileImage) {
      missing.push('Profile image');
    }

    const v = driver.vehicle || {};
    if (
      !v.type ||
      !v.brand ||
      !v.name ||
      !v.numberPlate ||
      !v.color ||
      !v.modelYear
    ) {
      missing.push('Complete vehicle details');
    }

    if (missing.length > 0) {
      logger.warn('Onboarding incomplete for driver:', req.user.id, missing);
      return res.status(403).json({
        success: false,
        message: 'Please complete your onboarding to continue',
        missingSteps: missing,
      });
    }

    next();
  } catch (err) {
    logger.error('Onboarding check failed:', err);
    next(new AppError('Internal error validating onboarding', 500));
  }
};

module.exports = {
  requireCompleteOnboarding,
};

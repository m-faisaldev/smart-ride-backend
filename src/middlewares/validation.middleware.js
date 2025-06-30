const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const validateUserInput = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.body) {
    logger.warn('Validation failed: Request body is required');
    return next(new AppError('Request body is required', 400));
  }

  next();
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      logger.warn('Validation failed:', errorMessage);
      return next(new AppError(errorMessage, 400));
    }

    req.validatedBody = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      logger.warn('Validation failed:', errorMessage);
      return next(new AppError(errorMessage, 400));
    }

    req.validatedQuery = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      logger.warn('Validation failed:', errorMessage);
      return next(new AppError(errorMessage, 400));
    }

    req.validatedParams = value;
    next();
  };
};

module.exports = {
  validateUserInput,
  validateBody,
  validateQuery,
  validateParams,
};

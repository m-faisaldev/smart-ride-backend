const AppError = require('./AppError');
const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    if (error.isJoi) {
      error = new AppError('Validation failed', 400);
      error.errors = err.details.map((detail) => detail.message);
      error.details = err.details.map((detail) => ({
        field: detail.context?.key || detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      error = new AppError(`${field} '${value}' already exists`, 400);
      error.details = [
        { field, message: `${field} '${value}' already exists`, value },
      ];
    } else if (error.name === 'ValidationError') {
      error = new AppError('Validation failed', 400);
      error.errors = Object.values(err.errors).map((val) => val.message);
      error.details = Object.entries(err.errors).map(([field, err]) => ({
        field,
        message: err.message,
        value: err.value,
      }));
    } else if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      error = new AppError('Token expired', 401);
    } else if (error.name === 'CastError') {
      error = new AppError(`Invalid ${error.path}: ${error.value}`, 400);
      error.details = [
        {
          field: error.path,
          message: `Invalid ${error.path}`,
          value: error.value,
        },
      ];
    } else if (error.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File too large', 400);
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      error = new AppError('Unexpected file field', 400);
    } else if (error.name === 'MongoNetworkError') {
      error = new AppError('Database connection error', 503);
    } else if (error.status === 429) {
      error = new AppError('Too many requests, please try again later', 429);
    } else {
      error = new AppError(
        error.message || 'Internal server error',
        error.statusCode || 500,
      );
    }
  }

  logger.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  const errorResponse = {
    success: false,
    status: error.status,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(error.details && { details: error.details }),
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  res.status(error.statusCode).json(errorResponse);
};

module.exports = errorHandler;

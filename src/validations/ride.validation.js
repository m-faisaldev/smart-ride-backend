const Joi = require('joi');

const locationSchema = Joi.object({
  type: Joi.string().valid('Point').required(),
  coordinates: Joi.array()
    .items(
      Joi.number().min(-180).max(180), // longitude
      Joi.number().min(-90).max(90), // latitude
    )
    .length(2)
    .required(),
});

const createRideRequestSchema = Joi.object({
  vehicleType: Joi.string()
    .valid('mini car', 'AC', 'bike', 'auto')
    .required()
    .messages({
      'any.required': 'Vehicle type is required',
      'any.only':
        'Invalid vehicle type. Must be one of: mini car, AC, bike, auto',
    }),

  pickUpLocation: locationSchema
    .required()
    .messages({
      'any.required': 'Pick up location is required',
    }),

  dropOffLocations: Joi.array()
    .items(locationSchema)
    .min(1)
    .max(3)
    .required()
    .messages({
      'any.required': 'Drop off locations are required',
      'array.min': 'At least one drop off location is required',
      'array.max': 'Maximum 3 drop off locations allowed',
    }),

  fareAmount: Joi.number().min(0).required().messages({
    'any.required': 'Fare amount is required',
    'number.min': 'Fare amount must be greater than 0',
  }),
});

const acceptRideSchema = Joi.object({
  fareAmountDriver: Joi.number().min(0).required().messages({
    'any.required': 'Fare amount is required',
    'number.min': 'Fare amount must be greater than 0',
  }),
});

const availableRidesQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  page: Joi.number().integer().min(1).default(1),
  vehicleType: Joi.string().valid('CAR', 'BIKE', 'AUTO', 'AC').uppercase(),
  maxDistance: Joi.number().min(0).default(100000),
}).default({});

const rideIdParamSchema = Joi.object({
  rideId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Ride ID is required',
      'string.pattern.base': 'Invalid ride ID format',
    }),
});

const rideReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5',
  }),
  comment: Joi.string().trim().max(500).optional(),
});

const rideQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid(
    'pending',
    'offered',
    'accepted',
    'rejected',
    'arrived',
    'started',
    'completed',
    'cancelled',
    'expired',
  ),
});

const rideActionParamsSchema = Joi.object({
  rideId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'any.required': 'Ride ID is required',
      'string.pattern.base': 'Invalid ride ID format',
    }),
});

const rideActionSchema = Joi.object({}).messages({
  'object.unknown': 'No body parameters needed for this action',
});

module.exports = {
  createRideRequestSchema,
  acceptRideSchema,
  rideIdParamSchema,
  availableRidesQuerySchema,
  rideQuerySchema,
  rideActionParamsSchema,
  rideActionSchema,
  rideReviewSchema,
};

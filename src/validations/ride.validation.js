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
    .valid('mini car', 'ac car', 'bike', 'auto', 'tourbus')
    .required()
    .messages({
      'any.required': 'Vehicle type is required',
      'any.only':
        'Invalid vehicle type. Must be one of: mini car, ac car, bike, auto, tourbus',
    }),

  isGroupRide: Joi.boolean().optional(),

  pickUpLocation: locationSchema.required().messages({
    'any.required': 'Pick up location is required',
  }),

  fareAmount: Joi.number().min(0).required().messages({
    'any.required': 'Fare amount is required',
    'number.min': 'Fare amount must be greater than 0',
  }),
}).custom((value, helpers) => {
  if (value.vehicleType === 'tourbus' && !value.isGroupRide) {
    return helpers.error('any.invalid', {
      message: 'tourbus is only allowed for group rides',
    });
  }
  return value;
}, 'Group ride vehicle type validation');

module.exports = {
  createRideRequestSchema,
};

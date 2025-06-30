const Joi = require('joi');

const updateDriverDetailsSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name cannot be empty',
  }),
  cnic: Joi.string()
    .trim()
    .length(13)
    .pattern(/^\d{13}$/)
    .required()
    .messages({
      'string.length': 'CNIC must be 13 digits',
      'string.pattern.base': 'CNIC must be numeric',
      'any.required': 'CNIC is required',
    }),
});

const updateVehicleDetailsSchema = Joi.object({
  type: Joi.string()
    .valid('car', 'ac', 'auto', 'bike', 'tourbus')
    .required()
    .messages({ 'any.only': 'Invalid vehicle type' }),

  brand: Joi.string().trim().required().messages({
    'string.empty': 'Brand is required',
    'any.required': 'Brand is required',
  }),

  name: Joi.string().trim().required().messages({
    'string.empty': 'Vehicle name is required',
    'any.required': 'Vehicle name is required',
  }),

  numberPlate: Joi.string().trim().required().messages({
    'string.empty': 'Number plate is required',
    'any.required': 'Number plate is required',
  }),

  color: Joi.string().trim().required().messages({
    'string.empty': 'Color is required',
    'any.required': 'Color is required',
  }),

  modelYear: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': 'Model year must be a number',
      'number.min': 'Model year is too old',
      'number.max': 'Model year cannot be in the future',
      'any.required': 'Model year is required',
    }),
});

module.exports = {
  updateDriverDetailsSchema,
  updateVehicleDetailsSchema,
};

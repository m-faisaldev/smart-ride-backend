const Joi = require('joi');
const { fields } = require('./common');

const phoneNumber = Joi.string()
  .pattern(/^\+[1-9]\d{1,14}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid phone number format',
    'any.required': 'Phone number is required',
  });

const password = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base':
      'Password must contain uppercase, lowercase and numbers',
    'any.required': 'Password is required',
  });

const code = Joi.string()
  .length(6)
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    'string.length': 'Code must be 6 digits',
    'string.pattern.base': 'Code must be numeric',
    'any.required': 'Code is required',
  });

module.exports = {
  'post_send-code': {
    body: Joi.object({
      phoneNumber: fields.phoneNumber,
    }),
  },

  'post_verify-code': {
    body: Joi.object({
      phoneNumber: fields.phoneNumber,
      code: fields.code,
    }),
  },

  'post_create-account': {
    body: Joi.object({
      phoneNumber: fields.phoneNumber,
      password: fields.password,
      confirmPassword: fields.password,
      firstName: Joi.string().min(2).required(),
      lastName: Joi.string().min(2).required(),
      email: Joi.string().email().optional(),
    }),
  },

  post_login: {
    body: Joi.object({
      phoneNumber: fields.phoneNumber,
      password: fields.password,
    }),
  },
};

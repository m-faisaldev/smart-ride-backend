const Joi = require('joi');

const socketEventSchemas = {
  joinRoom: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required(),

  sendMessage: Joi.object({
    rideId: Joi.string()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .required(),
    message: Joi.string().trim().min(1).max(500).required(),
  }),
};

const onboardingSchemas = {
  updateDriverDetails: Joi.object({
    name: Joi.string().trim().required(),
    cnic: Joi.string().trim().length(13).required(),
  }),

  updateVehicleDetails: Joi.object({
    type: Joi.string().valid('car', 'ac', 'auto', 'bike', 'tourbus').required(),
    brand: Joi.string().trim().required(),
    name: Joi.string().trim().required(),
    numberPlate: Joi.string().trim().required(),
    color: Joi.string().trim().required(),
    modelYear: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear())
      .required(),
  }),
};

module.exports = {
  socketEventSchemas,
  onboardingSchemas,
};

const express = require('express');
const router = express.Router();
const {
  validateBody,
} = require('../../../../middlewares/validation.middleware');
const {
  updateDriverDetailsSchema,
  updateVehicleDetailsSchema,
} = require('../../../../validations/Onboarding.validation');
const { protect } = require('../../../../middlewares/auth.middleware');
const { upload } = require('../../../../middlewares/upload.middleware');
const controller = require('../../../controllers/driver/v1/driverOnboarding.controller');

router.post(
  '/details',
  protect,
  validateBody(updateDriverDetailsSchema),
  controller.updateDriverDetails,
);

router.post(
  '/selfie',
  protect,
  upload.single('selfie'),
  controller.uploadProfileImage,
);

router.post(
  '/vehicle',
  protect,
  validateBody(updateVehicleDetailsSchema),
  controller.updateVehicleDetails,
);

module.exports = router;

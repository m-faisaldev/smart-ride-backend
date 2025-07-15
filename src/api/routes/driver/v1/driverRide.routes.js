const express = require('express');
const router = express.Router();
const {
  protectDriverOnly,
} = require('../../../../middlewares/auth.middleware');
const {
  requireCompleteOnboarding,
} = require('../../../../middlewares/onboarding.middleware');
const {
  validateBody,
  validateParams,
  validateQuery,
} = require('../../../../middlewares/validation.middleware');
const driverRideController = require('../../../controllers/driver/v1/driverRide.controller');

router.use(protectDriverOnly);
router.use(requireCompleteOnboarding);

const {
  availableRidesQuerySchema,
  acceptRideSchema,
  rideIdParamSchema,
} = require('../../../../validations/ride.validation');

router.get(
  '/available',
  validateQuery(availableRidesQuerySchema),
  driverRideController.getAvailableRides,
);

router.get(
  '/history',
  validateQuery(availableRidesQuerySchema),
  driverRideController.getRideHistory,
);

router.post(
  '/arrive/:rideId',
  validateParams(rideIdParamSchema),
  driverRideController.arriveAtLocation,
);

router.post(
  '/start/:rideId',
  validateParams(rideIdParamSchema),
  driverRideController.startRide,
);

router.post(
  '/end/:rideId',
  validateParams(rideIdParamSchema),
  driverRideController.endRide,
);

router.post(
  '/cancel/:rideId',
  validateParams(rideIdParamSchema),
  driverRideController.cancelRide,
);
router.post(
  '/reject/:rideId',
  validateParams(rideIdParamSchema),
  driverRideController.rejectRide,
);

router.post(
  '/offer/:rideId',
  validateParams(rideIdParamSchema),
  driverRideController.offerRide,
);

module.exports = router;

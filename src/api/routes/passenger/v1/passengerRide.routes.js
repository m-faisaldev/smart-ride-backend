const express = require('express');
const router = express.Router();

const {
  protectPassengerOnly,
} = require('../../../../middlewares/auth.middleware');
const {
  validateBody,
  validateParams,
  validateQuery,
} = require('../../../../middlewares/validation.middleware');
const controller = require('../../../controllers/passenger/v1/passengerRide.controller');

router.use(protectPassengerOnly);

const {
  createRideRequestSchema,
  rideIdParamSchema,
} = require('../../../../validations/ride.validation');

router.post(
  '/',
  validateBody(createRideRequestSchema),
  controller.createRideRequest,
);
router.get('/', controller.getMyActiveRides);
router.get('/history', controller.getPassengerHistory);
router.get(
  '/:rideId',
  validateParams(rideIdParamSchema),
  controller.getRideDetails,
);
router.post(
  '/cancel/:rideId',
  validateParams(rideIdParamSchema),
  controller.cancelRideRequest,
);
router.post(
  '/coming/:rideId',
  validateParams(rideIdParamSchema),
  controller.confirmComing,
);
router.post(
  '/accept/:rideId',
  validateParams(rideIdParamSchema),
  controller.acceptDriverOffer,
);
router.post(
  '/decline/:rideId',
  validateParams(rideIdParamSchema),
  controller.declineRideOffer,
);
router.post(
  '/review/:rideId',
  validateParams(rideIdParamSchema),
  controller.completeRideWithReview,
);
router.get(
  '/offers/:rideId',
  validateParams(rideIdParamSchema),
  controller.getOffersForRide,
);

router.post(
  '/accept-offer/:rideId/:offerId',
  validateParams(rideIdParamSchema),
  controller.acceptOffer,
);

module.exports = router;

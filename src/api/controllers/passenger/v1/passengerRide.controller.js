const passengerRideService = require('../../../../services/passenger/passengerRide.service');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');
const axios = require('axios');

const createRideRequest = async (req, res, next) => {
  try {
    const rideData = req.body;
    const userId = req.user._id;

    // Validate input
    if (
      !rideData.pickUpLocation ||
      !rideData.dropOffLocation ||
      !rideData.passenger_count
    ) {
      return next(
        new AppError(
          'Pickup location, dropoff location, and passenger count are required',
          400,
        ),
      );
    }

    const recommenderUrl = 'http://127.0.0.1:5000/getSuggestedFare';
    const { pickUpLocation, dropOffLocation, passenger_count } = rideData;

    try {
      const response = await axios.post(recommenderUrl, {
        pickup: {
          lat: pickUpLocation.coordinates[1],
          lng: pickUpLocation.coordinates[0],
        },
        dropoff: {
          lat: dropOffLocation.coordinates[1],
          lng: dropOffLocation.coordinates[0],
        },
        passenger_count,
      });

      rideData.suggestedFare = response.data.suggested_fare;
    } catch (error) {
      logger.error('Error calling recommender API:', error.message);
      return next(new AppError('Failed to fetch suggested fare', 500));
    }

    const ride = await passengerRideService.createRide(userId, rideData);

    res.status(201).json({
      success: true,
      message: 'Ride created',
      suggestedFare: rideData.suggestedFare,
      ride,
    });
  } catch (err) {
    logger.error('Error creating ride:', err.message);
    next(new AppError('Failed to create ride', 500));
  }
};

const getMyActiveRides = async (req, res, next) => {
  try {
    const rides = await passengerRideService.fetchActiveRides(req.user._id);
    res.status(200).json({ success: true, rides });
  } catch (err) {
    logger.error('Error fetching active rides:', err);
    next(new AppError('Failed to fetch active rides', 500));
  }
};

const getOffersForRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const offers = await passengerRideService.getOffersForRide(rideId);
    res.status(200).json({ success: true, offers });
  } catch (err) {
    logger.error('Error fetching offers:', err);
    next(new AppError('Failed to fetch offers', 500));
  }
};

const acceptOffer = async (req, res, next) => {
  try {
    const { rideId, offerId } = req.params;
    const ride = await passengerRideService.acceptOffer(
      req.user._id,
      rideId,
      offerId,
    );
    res.status(200).json({ success: true, message: 'Offer accepted', ride });
  } catch (err) {
    logger.error('Error accepting offer:', err);
    next(new AppError('Failed to accept offer', 400));
  }
};

const acceptDriverOffer = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await passengerRideService.acceptRideOffer(
      req.user._id,
      rideId,
    );
    res.json({ success: true, message: 'Ride accepted', ride });
  } catch (err) {
    logger.error('Error accepting ride offer:', err);
    next(new AppError('Failed to accept ride offer', 400));
  }
};

const declineRideOffer = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await passengerRideService.declineRideOffer(
      req.user._id,
      rideId,
    );
    res.json({ success: true, message: 'Ride offer declined', ride });
  } catch (err) {
    logger.error('Error declining ride offer:', err);
    next(new AppError('Failed to decline ride offer', 400));
  }
};

const cancelRideRequest = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await passengerRideService.cancelRide(req.user._id, rideId);
    res.json({ success: true, message: 'Ride cancelled', ride });
  } catch (err) {
    logger.error('Error cancelling ride:', err);
    next(new AppError('Failed to cancel ride', 400));
  }
};

const confirmComing = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await passengerRideService.confirmComing(req.user._id, rideId);
    res.json({ success: true, message: 'Passenger confirmed coming', ride });
  } catch (err) {
    logger.error('Error confirming coming:', err);
    next(new AppError('Failed to confirm coming', 400));
  }
};

const completeRideWithReview = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { rating, comment } = req.body;
    const ride = await passengerRideService.completeRideWithReview(
      req.user._id,
      rideId,
      rating,
      comment,
    );
    res.json({ success: true, message: 'Ride reviewed successfully', ride });
  } catch (err) {
    logger.error('Error completing ride with review:', err);
    next(new AppError('Failed to complete ride with review', 400));
  }
};

const getPassengerHistory = async (req, res, next) => {
  try {
    const passengerId = req.user._id;
    const rides =
      await passengerRideService.getPassengerRideHistory(passengerId);
    res.status(200).json({ success: true, rides });
  } catch (err) {
    logger.error('Error fetching passenger ride history:', err);
    next(new AppError('Failed to fetch passenger ride history', 500));
  }
};

const getRideDetails = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const passengerId = req.user._id;

    const ride = await passengerRideService.getRideDetails(passengerId, rideId);
    res.status(200).json({ success: true, ride });
  } catch (err) {
    logger.error('Error fetching ride details:', err);
    next(new AppError('Failed to fetch ride details', 500));
  }
};

module.exports = {
  createRideRequest,
  getMyActiveRides,
  getOffersForRide,
  acceptOffer,
  acceptDriverOffer,
  declineRideOffer,
  cancelRideRequest,
  confirmComing,
  completeRideWithReview,
  getPassengerHistory,
  getRideDetails,
};

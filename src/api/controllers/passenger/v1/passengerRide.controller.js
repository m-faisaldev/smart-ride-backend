const passengerRideService = require('../../../../services/passenger/passengerRide.service');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

const createRideRequest = async (req, res, next) => {
  try {
    const ride = await passengerRideService.createRide(req.user._id, req.body);
    res.status(201).json({ success: true, message: 'Ride created', ride });
  } catch (err) {
    logger.error('Error creating ride:', err);
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
  acceptDriverOffer,
  declineRideOffer,
  cancelRideRequest,
  confirmComing,
  completeRideWithReview,
  getPassengerHistory,
  getRideDetails,
};

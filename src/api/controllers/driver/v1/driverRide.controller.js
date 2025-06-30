const { StatusCodes } = require('http-status-codes');
const rideService = require('../../../../services/driver/driverRide.service');
const Ride = require('../../../../models/ride.model');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

const getAvailableRides = async (req, res, next) => {
  try {
    const { vehicleType, maxDistance, limit, page } = req.query;
    const driverId = req.user._id;

    const now = new Date();
    await Ride.updateMany(
      { status: 'pending', expiresAt: { $lte: now } },
      { $set: { status: 'expired' } },
    );

    const rides = await rideService.fetchAvailableRides(driverId);

    res.status(StatusCodes.OK).json({
      success: true,
      rides,
      meta: {
        total: rides.length,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      },
    });
  } catch (error) {
    logger.error('Error fetching available rides:', error);
    next(new AppError('Server error', StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const getRideHistory = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    const rides = await rideService.getDriverRideHistory(driverId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride history retrieved successfully',
      data: {
        rides,
        total: rides.length,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve ride history:', error);
    next(
      new AppError(
        'Failed to retrieve ride history',
        StatusCodes.INTERNAL_SERVER_ERROR,
      ),
    );
  }
};

const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { fareAmountDriver } = req.body;
    const driverId = req.user._id;

    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== 'pending') {
      return next(new AppError('Ride not available', StatusCodes.NOT_FOUND));
    }

    if (ride.expiresAt <= new Date()) {
      ride.status = 'expired';
      await ride.save();
      return next(new AppError('Ride has expired', StatusCodes.GONE));
    }

    const updatedRide = await rideService.acceptRide(
      rideId,
      driverId,
      fareAmountDriver,
    );
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Ride accepted', ride: updatedRide });
  } catch (error) {
    logger.error('Failed to accept ride:', error);
    next(
      new AppError('Failed to accept ride', StatusCodes.INTERNAL_SERVER_ERROR),
    );
  }
};

const rejectRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.rejectRide(rideId);
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Ride rejected', ride });
  } catch (error) {
    logger.error('Failed to reject ride:', error);
    next(
      new AppError('Failed to reject ride', StatusCodes.INTERNAL_SERVER_ERROR),
    );
  }
};

const arriveAtLocation = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user._id;

    const ride = await rideService.arriveAtLocation(rideId, driverId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Arrived at pickup location',
      ride,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const startRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findOne({
      _id: rideId,
      status: 'arrived',
    });

    if (!ride) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Ride not found or not in arrived state',
      });
    }

    if (
      !ride.passengerConfirmation ||
      ride.passengerConfirmation !== 'coming'
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Cannot start ride - waiting for passenger confirmation',
      });
    }

    ride.status = 'started';
    await ride.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride started successfully',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

const endRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.updateRideStatus(
      rideId,
      'started',
      'completed',
    );
    res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Ride completed', ride });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

const cancelRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user._id;

    const ride = await rideService.cancelRide(rideId, driverId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride offer cancelled successfully',
      ride,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const rejectOfferedRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user._id;

    const ride = await rideService.rejectOfferedRide(rideId, driverId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Ride offer withdrawn successfully',
      ride,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getAvailableRides,
  getRideHistory,
  acceptRide,
  rejectRide,
  arriveAtLocation,
  startRide,
  endRide,
  cancelRide,
  rejectOfferedRide,
};

const Ride = require('../../models/ride.model');
const Driver = require('../../models/driver.model');
const OfferedRide = require('../../models/offeredRide.model');
const AppError = require('../../utils/AppError');

const fetchAvailableRides = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver || !driver.vehicle || !driver.vehicle.type) {
      throw new AppError('Driver vehicle information not found', 400);
    }

    const driverVehicleType = driver.vehicle.type;
    if (
      !['mini car', 'ac car', 'bike', 'auto', 'tourbus'].includes(
        driverVehicleType,
      )
    ) {
      throw new AppError('Invalid vehicle type', 400);
    }

    // Show all rides with status 'pending' (not accepted)
    let query = {
      status: 'pending',
      vehicleType: driverVehicleType,
    };

    return await Ride.find(query);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch available rides', 500);
  }
};

const offerRide = async (rideId, driverId, driverOfferedAmount) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new AppError('Ride not found', 404);
    }
    if (ride.status !== 'pending') {
      throw new AppError('Ride is not available for offers', 400);
    }

    const existingOffer = await OfferedRide.findOne({ rideId, driverId });
    if (existingOffer) {
      throw new AppError('You have already offered for this ride', 400);
    }
    // Create an offer
    const offer = await OfferedRide.create({
      rideId,
      driverId,
      driverOfferedAmount,
      rideSnapshot: ride.toObject(),
    });
    return offer;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to offer ride', 500);
  }
};

const getRideHistory = async (driverId) => {
  try {
    return await Ride.find({
      driver: driverId,
      status: {
        $in: [
          'accepted',
          'rejected',
          'arrived',
          'started',
          'completed',
          'cancelled',
          'expired',
        ],
      },
    }).sort({ createdAt: -1 });
  } catch (error) {
    throw new AppError('Failed to fetch ride history', 500);
  }
};

const rejectRide = async (rideId) => {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      status: 'pending',
      driver: null,
    });

    if (!ride) {
      throw new AppError('Ride not available or already taken', 400);
    }

    ride.status = 'rejected';
    await ride.save();

    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to reject ride', 500);
  }
};

const updateRideStatus = async (rideId, expectedStatus, newStatus) => {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride || ride.status !== expectedStatus) {
      throw new AppError(
        `Cannot transition ride from ${ride?.status || 'unknown'} to ${newStatus}`,
        400,
      );
    }

    ride.status = newStatus;
    await ride.save();
    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update ride status', 500);
  }
};

const cancelRide = async (rideId) => {
  try {
    const ride = await Ride.findById(rideId);

    if (!ride || !['accepted', 'arrived'].includes(ride.status)) {
      throw new AppError(
        `Cannot cancel ride with status ${ride?.status || 'unknown'}`,
        400,
      );
    }

    ride.status = 'cancelled';
    await ride.save();
    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to cancel ride', 500);
  }
};

const getDriverRideHistory = async (driverId) => {
  try {
    const rides = await Ride.find({
      driver: driverId,
      status: {
        $in: ['rejected', 'completed'],
      },
    }).sort({ createdAt: -1 });

    return rides;
  } catch (error) {
    throw new AppError('Failed to fetch driver ride history', 500);
  }
};

const arriveAtLocation = async (rideId, driverId) => {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driver: driverId,
      status: 'accepted',
    });

    if (!ride) {
      throw new AppError('Ride not found or not in accepted state', 400);
    }

    ride.status = 'arrived';
    await ride.save();
    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update arrival status', 500);
  }
};

const rejectOfferedRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driver: driverId,
      status: 'pending',
    });

    if (!ride) {
      throw new AppError('Ride not found or not in offered state', 400);
    }

    ride.status = 'rejected';
    ride.driver = null;
    ride.fareAmountDriver = undefined;
    await ride.save();

    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to reject offered ride', 500);
  }
};

const cancelOfferedRide = async (rideId, driverId) => {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driver: driverId,
      status: 'offered',
    });

    if (!ride) {
      throw new AppError('Ride not found or not in offered state', 400);
    }

    ride.status = 'cancelled';
    ride.driver = null;
    ride.fareAmountDriver = undefined;
    await ride.save();

    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to cancel offered ride', 500);
  }
};

module.exports = {
  fetchAvailableRides,
  offerRide,
  getRideHistory,
  rejectRide,
  updateRideStatus,
  cancelRide,
  getDriverRideHistory,
  arriveAtLocation,
  rejectOfferedRide,
  cancelOfferedRide,
};

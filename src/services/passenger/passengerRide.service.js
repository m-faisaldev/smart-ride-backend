const Ride = require('../../models/ride.model');
const AppError = require('../../utils/AppError');

const createRide = async (passengerId, rideData) => {
  const ride = new Ride({
    ...rideData,
    passenger: passengerId,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await ride.save();
  return ride;
};

const fetchActiveRides = async (passengerId) => {
  return Ride.find({
    passenger: passengerId,
    status: { $in: ['pending', 'offered', 'accepted', 'arrived', 'started'] },
  }).sort({ createdAt: -1 });
};

const acceptRideOffer = async (passengerId, rideId) => {
  const ride = await Ride.findById(rideId);

  if (!ride || ride.passenger.toString() !== passengerId.toString()) {
    throw new Error('Unauthorized or invalid ride');
  }

  if (ride.status !== 'offered') {
    throw new Error('Ride is not in an offered state');
  }

  ride.status = 'accepted';
  await ride.save();

  return ride;
};

const declineRideOffer = async (passengerId, rideId) => {
  const ride = await Ride.findById(rideId);

  if (!ride || ride.passenger.toString() !== passengerId.toString()) {
    throw new Error('Unauthorized or invalid ride');
  }

  if (ride.status !== 'offered') {
    throw new Error('Ride is not in an offered state');
  }

  ride.status = 'rejected';
  await ride.save();

  return ride;
};

const cancelRide = async (passengerId, rideId) => {
  const ride = await Ride.findById(rideId);

  if (!ride || ride.passenger.toString() !== passengerId.toString()) {
    throw new Error('Unauthorized or invalid ride');
  }
  if (ride.status !== 'accepted') {
    throw new Error(
      'Only accepted rides can be cancelled. For offered rides, use decline instead.',
    );
  }

  ride.status = 'cancelled';
  await ride.save();

  return ride;
};

const confirmComing = async (passengerId, rideId) => {
  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      throw new AppError('Ride not found', 404);
    }

    if (ride.passenger.toString() !== passengerId.toString()) {
      throw new AppError('You are not authorized for this ride', 403);
    }

    if (ride.status !== 'arrived') {
      throw new AppError('Cannot confirm - driver has not arrived yet', 400);
    }

    ride.passengerConfirmation = 'coming';
    await ride.save();

    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to confirm coming status', 500);
  }
};

const completeRideWithReview = async (passengerId, rideId, rating, comment) => {
  const ride = await Ride.findById(rideId);

  if (!ride || ride.passenger.toString() !== passengerId.toString()) {
    throw new Error('Unauthorized or invalid ride');
  }

  if (ride.status !== 'completed') {
    throw new Error('Ride not completed yet by driver');
  }

  ride.review = {
    rating,
    comment,
    reviewedAt: new Date(),
  };

  await ride.save();
  return ride;
};

const getPassengerRideHistory = async (passengerId) => {
  try {
    const rides = await Ride.find({
      passenger: passengerId,
      status: { $in: ['completed', 'cancelled'] },
    }).sort({ createdAt: -1 });

    if (!rides || rides.length === 0) {
      throw new Error('No ride history found');
    }

    return rides;
  } catch (error) {
    throw new Error('Failed to fetch passenger ride history');
  }
};

const getRideDetails = async (passengerId, rideId) => {
  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      throw new AppError('Ride not found', 404);
    }

    if (ride.passenger.toString() !== passengerId.toString()) {
      throw new AppError('You are not authorized to view this ride', 403);
    }

    return ride;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch ride details', 500);
  }
};

module.exports = {
  createRide,
  fetchActiveRides,
  acceptRideOffer,
  declineRideOffer,
  cancelRide,
  confirmComing,
  completeRideWithReview,
  getPassengerRideHistory,
  getRideDetails,
};

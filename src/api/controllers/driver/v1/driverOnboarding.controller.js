const Driver = require('../../../../models/driver.model');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');
const { deleteOldFile } = require('../../../../middlewares/upload.middleware');
const path = require('path');

exports.updateDriverDetails = async (req, res, next) => {
  try {
    const { name, cnic } = req.validatedBody;

    if (!name || !cnic) {
      return next(new AppError('Name and CNIC are required', 400));
    }

    logger.info('updateDriverDetails req.user:', req.user);

    const driverId = req.user.id || req.user._id;
    if (!driverId) {
      return next(new AppError('User ID not found in token', 401));
    }

    let foundDriver = await Driver.findById(driverId);
    if (!foundDriver) {
      return next(new AppError('Driver not found', 404));
    }

    const existingCnic = await Driver.findOne({
      cnic: cnic.trim(),
      _id: { $ne: driverId },
    });
    if (existingCnic) {
      return next(
        new AppError(
          'This CNIC is already registered with another driver.',
          409,
        ),
      );
    }

    foundDriver.name = name.trim();
    foundDriver.cnic = cnic.trim();
    foundDriver.isOnboarded = true;
    await foundDriver.save();

    res.json({
      success: true,
      message: 'Driver details updated successfully',
      data: {
        name: foundDriver.name,
        cnic: foundDriver.cnic,
        isOnboarded: foundDriver.isOnboarded,
      },
    });
  } catch (err) {
    logger.error('Error updating driver details:', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.cnic) {
      return next(
        new AppError(
          'This CNIC is already registered with another driver.',
          409,
        ),
      );
    }
    next(new AppError('Error updating driver details', 500));
  }
};

exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Profile image is required', 400));
    }

    const driver = await Driver.findById(req.user.id);

    if (!driver) {
      if (req.file) deleteOldFile(req.file.path);
      return next(new AppError('Driver not found', 404));
    }

    if (driver.profileImage) {
      const oldPath = path.join(
        __dirname,
        '../../../../public',
        driver.profileImage,
      );
      deleteOldFile(oldPath);
    }

    const relativePath = path
      .join(req.file.destination.split('public')[1], req.file.filename)
      .replace(/\\/g, '/');

    driver.profileImage = relativePath;
    await driver.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImageUrl: relativePath,
      },
    });
  } catch (err) {
    if (req.file) deleteOldFile(req.file.path);
    logger.error('Error uploading profile image:', err);
    next(new AppError('Error uploading profile image', 500));
  }
};

exports.updateVehicleDetails = async (req, res, next) => {
  try {
    const { type, brand, name, numberPlate, color, modelYear } =
      req.validatedBody;

    const required = [type, brand, name, numberPlate, color, modelYear];
    if (required.some((v) => !v)) {
      return next(new AppError('All vehicle details are required', 400));
    }

    const driver = await Driver.findById(req.user.id);

    if (!driver) {
      return next(new AppError('Driver not found', 404));
    }

    driver.vehicle = { type, brand, name, numberPlate, color, modelYear };
    await driver.save();

    res.json({
      success: true,
      message: 'Vehicle details updated successfully',
      data: driver.vehicle,
    });
  } catch (err) {
    logger.error('Error updating vehicle details:', err);
    next(new AppError('Error updating vehicle details', 500));
  }
};

const Driver = require('../../models/driver.model');

const driverOnboardingService = {
  async updateDriverDetails(driverId, name, cnic) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new Error('Driver not found');
    driver.name = name;
    driver.cnic = cnic;
    return await driver.save();
  },

  async uploadProfileImage(driverId, imagePath) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new Error('Driver not found');
    driver.profileImage = imagePath;
    return await driver.save();
  },

  async updateVehicle(driverId, vehicleData) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new Error('Driver not found');
    driver.vehicle = vehicleData;
    return await driver.save();
  },
};

module.exports = driverOnboardingService;

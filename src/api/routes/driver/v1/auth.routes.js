const express = require('express');
const router = express.Router();
const {
  validateUserInput,
} = require('../../../../middlewares/validation.middleware');
const { protect } = require('../../../../middlewares/auth.middleware');
const {
  verifyResetToken,
} = require('../../../../middlewares/reset.middleware');
const driverAuthController = require('../../../controllers/driver/v1/driverAuth.controller');

router.post('/register', validateUserInput, driverAuthController.sendCode);
router.post('/verify', validateUserInput, driverAuthController.verifyCode);
router.post(
  '/setPassword',
  validateUserInput,
  driverAuthController.createAccount,
);
router.post('/login', validateUserInput, driverAuthController.login);
router.post('/logout', protect, driverAuthController.logout);
router.delete('/delete', protect, driverAuthController.deleteAccount);

router.post('/forgotPassword', driverAuthController.forgotPassword);
router.post('/verifyReset', driverAuthController.verifyReset);
router.post(
  '/resetPasswordWithToken',
  verifyResetToken,
  driverAuthController.resetPasswordWithToken,
);

module.exports = router;

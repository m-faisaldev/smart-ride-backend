const express = require('express');
const router = express.Router();
const {
  validateUserInput,
} = require('../../../../middlewares/validation.middleware');
const { protect } = require('../../../../middlewares/auth.middleware');
const {
  verifyResetToken,
} = require('../../../../middlewares/reset.middleware');
const passengerAuthController = require('../../../controllers/passenger/v1/passengerAuth.controller');

router.post('/register', validateUserInput, passengerAuthController.sendCode);
router.post('/verify', validateUserInput, passengerAuthController.verifyCode);
router.post(
  '/setPassword',
  validateUserInput,
  passengerAuthController.createAccount,
);
router.post('/login', validateUserInput, passengerAuthController.login);
router.post('/logout', protect, passengerAuthController.logout);
router.delete('/delete', protect, passengerAuthController.deleteAccount);
router.post('/forgotPassword', passengerAuthController.forgotPassword);
router.post(
  '/resetPasswordWithToken',
  verifyResetToken,
  passengerAuthController.resetPasswordWithToken,
);
router.post('/verifyReset', passengerAuthController.verifyReset);

module.exports = router;

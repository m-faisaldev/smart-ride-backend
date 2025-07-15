const express = require('express');
const router = express.Router();

const driverV1Routes = require('./driver/v1/auth.routes');
const driverOnboardingRoutes = require('./driver/v1/driverOnboarding.routes');
const uploadRoutes = require('./driver/v1/upload.routes');
const passengerV1Routes = require('./passenger/v1/auth.routes');
const driverRideRoutes = require('./driver/v1/driverRide.routes');
const passengerRideRoutes = require('./passenger/v1/passengerRide.routes');
const messageRoutes = require('./chat/v1/message.routes');
const groupChatRoutes = require('./chat/v1/groupChat.routes');
const chatbotRoutes = require('./chat/v1/chatbot.routes');

router.use('/api/v1/driver', driverV1Routes);
router.use('/api/v1/driver/onboarding', driverOnboardingRoutes);
router.use('/api/v1/passenger', passengerV1Routes);
router.use('/api/v1/driver/rides', driverRideRoutes);
router.use('/api/v1/passenger/rides', passengerRideRoutes);
router.use('/api/v1/chat', messageRoutes);
router.use('/api/v1/driver/upload', uploadRoutes);
router.use('/api/v1/chat/groups', groupChatRoutes);
router.use('/api/v1/chatbot', chatbotRoutes);

module.exports = router;

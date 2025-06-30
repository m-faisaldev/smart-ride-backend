const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../../middlewares/auth.middleware');
const chatController = require('../../../controllers/chat/v1/chat.controller');

const protect = authMiddleware.protect || authMiddleware;

router.post('/send/:rideId', protect, chatController.sendMessage);
router.get('/history/:rideId', protect, chatController.getChatHistory);
router.post('/join/:rideId', protect, chatController.joinRoom);

module.exports = router;

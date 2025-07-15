const express = require('express');
const router = express.Router();
const chatbotController = require('../../../controllers/chat/v1/chatbot.controller');
const { protect } = require('../../../../middlewares/auth.middleware');

router.post('/driver', protect, chatbotController.driverChatbot);
router.post('/passenger', protect, chatbotController.passengerChatbot);

module.exports = router; 
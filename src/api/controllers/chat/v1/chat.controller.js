const chatService = require('../../../../services/chat/chat.service');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

const sendMessage = async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message?.trim()) {
      return next(new AppError('Message is required', 400));
    }

    const userRideInfo = await chatService.getUserRideInfo(rideId, userId);
    if (!userRideInfo.authorized) {
      return next(new AppError(userRideInfo.error, 403));
    }

    const savedMessage = await chatService.saveMessage({
      rideId,
      senderId: userId,
      receiverId: userRideInfo.otherPartyId,
      message: message.trim(),
      senderRole: userRideInfo.role,
    });

    const chatIO = req.app.get('chatIO');
    if (chatIO) {
      chatIO.to(rideId).emit('receiveMessage', {
        _id: savedMessage._id,
        rideId: savedMessage.rideId,
        senderId: savedMessage.senderId,
        message: savedMessage.message,
        senderRole: savedMessage.senderRole,
        sentAt: savedMessage.sentAt,
        senderName: req.user.name || req.user.username,
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        _id: savedMessage._id,
        rideId: savedMessage.rideId,
        message: savedMessage.message,
        senderRole: savedMessage.senderRole,
        sentAt: savedMessage.sentAt,
      },
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(new AppError('Failed to send message', 500));
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    const userId = req.user._id;

    if (!rideId) {
      return next(new AppError('Ride ID is required', 400));
    }

    const history = await chatService.getChatHistory(rideId, userId);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    logger.error('Get chat history error:', error);
    next(new AppError('Failed to get chat history', 500));
  }
};

const joinRoom = async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    const userId = req.user._id;

    if (!rideId) {
      return res.status(400).json({ error: 'rideId is required' });
    }

    const userRideInfo = await chatService.getUserRideInfo(rideId, userId);
    if (!userRideInfo.authorized) {
      return res.status(403).json({ error: userRideInfo.error });
    }

    res.json({
      message: 'Authorized to join room',
      rideId,
      userRole: userRideInfo.role,
      roomId: rideId,
    });
  } catch (error) {
    console.error('Join room error:', error);
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  joinRoom,
};

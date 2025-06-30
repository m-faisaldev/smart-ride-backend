const Message = require('../../models/chat.model');
const Ride = require('../../models/ride.model');

const chatService = {
  async getUserRideInfo(rideId, userId) {
    try {
      const ride = await Ride.findById(rideId).lean();

      if (!ride) {
        return { authorized: false, error: 'Ride not found' };
      }

      if (ride.status !== 'accepted') {
        return {
          authorized: false,
          error: 'Chat only available for accepted rides',
        };
      }

      let userRole = null;
      let otherPartyId = null;

      if (ride.driver?.toString() === userId.toString()) {
        userRole = 'driver';
        otherPartyId = ride.passenger;
      } else if (ride.passenger?.toString() === userId.toString()) {
        userRole = 'passenger';
        otherPartyId = ride.driver;
      }

      if (!userRole) {
        return { authorized: false, error: 'User not part of this ride' };
      }

      return {
        authorized: true,
        role: userRole,
        otherPartyId,
        rideStatus: ride.status,
      };
    } catch (error) {
      console.error('Error validating user access:', error);
      throw error;
    }
  },

  async saveMessage(messageData) {
    try {
      const message = new Message({
        rideId: messageData.rideId,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        message: messageData.message.trim(),
        senderRole: messageData.senderRole,
        sentAt: new Date(),
      });

      return await message.save();
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  },

  async getMessagesByRideId(rideId) {
    try {
      return await Message.find({ rideId })
        .populate('senderId', 'name username email')
        .populate('receiverId', 'name username email')
        .sort({ sentAt: 1 });
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },
};

module.exports = chatService;

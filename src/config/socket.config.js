const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Ride = require('../models/ride.model');
const passengerGroupService = require('../services/chat/groupChat.service');
const chatService = require('../services/chat/chat.service');

module.exports = (server) => {
  let io;

  if (server.io) {
    io = server.io;
  } else {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    server.io = io;
  }

  const chatNamespace = io.of('/chat');
  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const rideId = socket.handshake.auth?.rideId;
      if (!token || !rideId)
        return next(new Error('Token and rideId are required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const ride = await Ride.findById(rideId).lean();
      if (!ride) return next(new Error('Ride not found'));
      if (ride.status !== 'accepted')
        return next(new Error('Chat allowed only for accepted rides'));

      const isPassenger = ride.passenger?.toString() === userId.toString();
      const isDriver = ride.driver?.toString() === userId.toString();
      if (!isPassenger && !isDriver)
        return next(new Error('You are not part of this ride'));

      socket.user = decoded;
      socket.rideId = rideId;
      socket.userRole = isPassenger ? 'passenger' : 'driver';
      next();
    } catch (error) {
      console.error('Chat socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log(
      `User ${socket.user._id} connected to chat for ride ${socket.rideId} as ${socket.userRole}`,
    );

    socket.join(socket.rideId);

    socket.to(socket.rideId).emit('userJoined', {
      userId: socket.user._id,
      userName: socket.user.name || socket.user.username,
      role: socket.userRole,
    });

    socket.on('message', async (data) => {
      try {
        const rideId = socket.rideId;
        const senderId = socket.user._id;
        const senderRole = socket.userRole;
        const ride = await Ride.findById(rideId);
        let receiverId = null;
        if (senderRole === 'driver') receiverId = ride.passenger;
        else if (senderRole === 'passenger') receiverId = ride.driver;
        if (!receiverId) throw new Error('Receiver not found');
        const saved = await chatService.saveMessage({
          rideId,
          senderId,
          receiverId,
          message: data.message,
          senderRole,
        });
        chatNamespace.to(rideId).emit('message', {
          _id: saved._id,
          rideId,
          senderId,
          receiverId,
          message: saved.message,
          senderRole,
          sentAt: saved.sentAt,
        });
      } catch (err) {
        socket.emit('chatError', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(
        `User ${socket.user._id} disconnected from chat for ride ${socket.rideId}`,
      );

      socket.to(socket.rideId).emit('userLeft', {
        userId: socket.user._id,
        userName: socket.user.name || socket.user.username,
        role: socket.userRole,
      });
    });
  });

  const passengerGroupNamespace = io.of('/groups');
  passengerGroupNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userType !== 'passenger')
        return next(new Error('Only passengers can access groups'));

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  passengerGroupNamespace.on('connection', (socket) => {
    socket.on('joinGroup', (groupId) => {
      socket.join(groupId);
    });

    socket.on('leaveGroup', (groupId) => {
      socket.leave(groupId);
    });

    socket.on('groupMessage', async (data) => {
      try {
        const message = await passengerGroupService.sendMessage(
          data.groupId,
          socket.user.id,
          data.content,
        );
        passengerGroupNamespace.to(data.groupId).emit('newMessage', message);
      } catch (error) {
        socket.emit('groupError', error.message);
      }
    });
  });

  return io;
};

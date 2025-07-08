const groupChatService = require('../../../../services/chat/groupChat.service');
const Ride = require('../../../../models/ride.model');
const GroupChat = require('../../../../models/group.model');
const GroupMessage = require('../../../../models/groupMessage.model');
const AppError = require('../../../../utils/AppError');
const logger = require('../../../../utils/logger');

const createGroup = async (req, res, next) => {
  try {
    const group = await groupChatService.createGroup(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group,
    });
  } catch (error) {
    logger.error('Group creation failed:', error);
    next(new AppError('Failed to create group', 500));
  }
};

const getAllGroups = async (req, res, next) => {
  try {
    const groups = await groupChatService.getAllGroups();
    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    logger.error('Failed to get all groups:', error);
    next(new AppError('Failed to get all groups', 500));
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await groupChatService.joinGroup(groupId, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      data: group,
    });
  } catch (error) {
    logger.error('Failed to join group:', error);
    next(new AppError('Failed to join group', 500));
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const io = req.app.get('io');
    const message = await groupChatService.sendMessage(
      groupId,
      req.user.id,
      content,
      io,
    );

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: message,
    });
  } catch (error) {
    logger.error('Failed to send message:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to send message',
      stack: error.stack,
    });
  }
};

const bookGroupRide = async (req, res, next) => {
  try {
    const {
      pickUpLocation,
      dropOffLocation,
      fareAmount,
      vehicleType,
      numberOfPassengers,
      dateOfDeparture,
      timeOfDeparture,
    } = req.body;
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const group = await GroupChat.findById(groupId).populate('creator');
    if (!group) throw new AppError('Group not found', 404);

    if (group.creator._id.toString() !== userId)
      throw new AppError('Only group admin can book a ride', 403);

    // Default vehicleType to 'tourbus' for group admin booking if not provided
    const rideVehicleType = vehicleType || 'tourbus';

    const ride = await Ride.create({
      passenger: userId,
      group: groupId,
      isGroupRide: true,
      groupAdmin: userId,
      pickUpLocation,
      dropOffLocation,
      fareAmount,
      vehicleType: rideVehicleType,
      numberOfPassengers,
      dateOfDeparture,
      timeOfDeparture,
      status: 'pending',
      expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    });

    res.status(201).json({
      success: true,
      message: 'Group ride booked successfully',
      data: ride,
    });
  } catch (error) {
    logger.error('Failed to book group ride:', error);
    next(new AppError('Failed to book group ride', 500));
  }
};

const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'firstName lastName phoneNumber')
      .sort({ timestamp: 1 });
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error('Failed to get group messages:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to get group messages',
      stack: error.stack,
    });
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const group = await groupChatService.leaveGroup(groupId, userId);
    res.status(200).json({
      success: true,
      message: 'Left group successfully',
      data: group,
    });
  } catch (error) {
    logger.error('Failed to leave group:', error);
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const result = await groupChatService.deleteGroup(groupId, userId);
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Failed to delete group:', error);
    next(error);
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  joinGroup,
  sendMessage,
  bookGroupRide,
  getGroupMessages,
  leaveGroup,
  deleteGroup,
};

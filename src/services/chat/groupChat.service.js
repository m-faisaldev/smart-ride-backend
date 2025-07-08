const PassengerGroup = require('../../models/group.model');
const GroupMessage = require('../../models/groupMessage.model');
const AppError = require('../../utils/AppError');
const mongoose = require('mongoose');

class GroupChatService {
  async createGroup(user, groupData) {
    const creatorId = user.id;
    try {
      const group = new PassengerGroup({
        name: groupData.name,
        creator: creatorId,
        tripDetails: {
          date: groupData.tripDetails.date,
          time: groupData.tripDetails.time,
          venue: groupData.tripDetails.venue,
          days: groupData.tripDetails.days,
          description: groupData.tripDetails.description,
        },
        members: [creatorId],
      });

      await group.save();
      return group;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  async getAllGroups() {
    try {
      return await PassengerGroup.find({ isActive: true })
        .populate('creator', 'firstName lastName phoneNumber')
        .populate('members', 'firstName lastName phoneNumber')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async joinGroup(groupId, userId) {
    try {
      const group = await PassengerGroup.findById(groupId);
      if (!group) {
        throw new AppError('Group not found', 404);
      }

      console.log('joinGroup received userId:', userId, 'type:', typeof userId);

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError(`Invalid user ID: ${userId}`, 400);
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const isMember = group.members.some(
        (member) => member.toString() === userObjectId.toString(),
      );

      if (!isMember) {
        group.members.push(userObjectId);
        await group.save();
      }

      const updatedGroup = await PassengerGroup.findById(groupId);
      return updatedGroup;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('joinGroup error:', error);
      throw new AppError(error.message || 'Failed to join group', 500);
    }
  }

  async sendMessage(groupId, userId, content, io) {
    try {
      const group = await PassengerGroup.findById(groupId);
      if (!group) {
        throw new AppError('Group not found', 404);
      }

      const isMember = group.members.some(
        (member) => member.toString() === userId.toString(),
      );

      if (!isMember) {
        throw new AppError('Only members can send messages', 403);
      }

      const message = await GroupMessage.create({
        group: groupId,
        sender: userId,
        content,
      });

      const populatedMsg = await GroupMessage.findById(message._id).populate(
        'sender',
        'firstName lastName phoneNumber',
      );

      if (io) {
        io.of('/groups').to(groupId).emit('newMessage', populatedMsg);
      }

      return populatedMsg;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  }

  async leaveGroup(groupId, userId) {
    try {
      const group = await PassengerGroup.findById(groupId);
      if (!group) {
        throw new AppError('Group not found', 404);
      }
      if (group.creator.toString() === userId.toString()) {
        throw new AppError('Group admin cannot leave the group', 403);
      }
      const initialLength = group.members.length;
      group.members = group.members.filter(
        (member) => member.toString() !== userId.toString(),
      );
      if (group.members.length === initialLength) {
        throw new AppError('User is not a member of the group', 400);
      }
      await group.save();
      return group;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to leave group', 500);
    }
  }

  async deleteGroup(groupId, userId) {
    try {
      const group = await PassengerGroup.findById(groupId);
      if (!group) {
        throw new AppError('Group not found', 404);
      }
      if (group.creator.toString() !== userId.toString()) {
        throw new AppError('Only group admin can delete the group', 403);
      }
      await GroupMessage.deleteMany({ group: groupId });
      await PassengerGroup.findByIdAndDelete(groupId);
      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to delete group', 500);
    }
  }
}

module.exports = new GroupChatService();

const express = require('express');
const router = express.Router();
const {
  protectPassengerOnly,
} = require('../../../../middlewares/auth.middleware');
const controller = require('../../../controllers/chat/v1/groupChat.controller');

router.use(protectPassengerOnly);

router.post('/', controller.createGroup);
router.get('/', controller.getAllGroups);
router.post('/join/:groupId', controller.joinGroup);
router.post('/leave/:groupId', controller.leaveGroup);
router.delete('/:groupId', controller.deleteGroup);
router.post('/messages/:groupId', controller.sendMessage);
router.post('/bookRide/:groupId', controller.bookGroupRide);
router.get('/messages/:groupId', controller.getGroupMessages);

module.exports = router;

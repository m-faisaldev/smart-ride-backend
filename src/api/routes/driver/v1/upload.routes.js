const express = require('express');
const router = express.Router();
const { upload } = require('../../../../middlewares/upload.middleware');
const {
  protectDriverOnly,
} = require('../../../../middlewares/auth.middleware');
const uploadController = require('../../../controllers/driver/v1/upload.controller');

router.use(protectDriverOnly);

router.post(
  '/license',
  upload.fields([
    { name: 'front-page', maxCount: 1 },
    { name: 'back-page', maxCount: 1 },
  ]),
  uploadController.uploadLicense,
);

module.exports = router;

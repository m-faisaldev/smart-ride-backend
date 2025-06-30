const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const createUploadDirs = () => {
  const dirs = ['driver-assets', 'profile-images', 'documents'];
  dirs.forEach((dir) => {
    const fullPath = path.join(__dirname, `../../public/${dir}`);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'driver-assets';

    if (file.fieldname === 'profile') {
      folder = 'profile-images';
    } else if (file.fieldname === 'document') {
      folder = 'documents';
    }

    cb(null, path.join(__dirname, `../../public/${folder}`));
  },

  filename: function (req, file, cb) {
    const userId = req.user?.id || 'unknown';

    const safeOriginalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${userId}-${file.fieldname}-${Date.now()}-${safeOriginalName}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    logger.warn('Invalid file type upload attempt:', file.mimetype);
    return cb(
      new AppError(
        'Invalid file type. Allowed types: JPG, JPEG, PNG, WebP, PDF',
        400,
      ),
      false,
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 3,
  },
});

const deleteOldFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('Deleted old file:', filePath);
    }
  } catch (err) {
    logger.error('Failed to delete old file:', err);
  }
};

module.exports = {
  upload,
  deleteOldFile,
};

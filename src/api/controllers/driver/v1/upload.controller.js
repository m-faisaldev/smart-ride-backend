exports.uploadSelfie = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Selfie not uploaded' });
    }

    res.status(200).json({
      success: true,
      message: 'Selfie uploaded',
      filename: req.file.filename,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadLicense = async (req, res, next) => {
  try {
    if (!req.files || !req.files['front-page'] || !req.files['back-page']) {
      return res.status(400).json({
        success: false,
        message: 'Both front and back pages are required',
      });
    }

    const frontPage = req.files['front-page'][0].filename;
    const backPage = req.files['back-page'][0].filename;

    res.status(200).json({
      success: true,
      message: 'License uploaded successfully',
      files: { frontPage, backPage },
    });
  } catch (err) {
    next(err);
  }
};

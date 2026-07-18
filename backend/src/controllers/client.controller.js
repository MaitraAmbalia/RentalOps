const clientService = require('../services/client.service');

exports.getProfile = async (req, res, next) => {
  try {
    const client = await clientService.getProfile(req.user.id);
    res.status(200).json({ success: true, client });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const client = await clientService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, client });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const profileImage = `/uploads/${req.file.filename}`;
    await clientService.updateProfile(req.user.id, { profileImage });
    res.status(200).json({ success: true, profileImage });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await clientService.changePassword(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

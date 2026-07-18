const vendorService = require('../services/vendor.service');

exports.getProfile = async (req, res, next) => {
  try {
    const vendor = await vendorService.getProfile(req.user.id);
    res.status(200).json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const vendor = await vendorService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await vendorService.getSettings(req.user.id);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await vendorService.updateSettings(req.user.id, req.body);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

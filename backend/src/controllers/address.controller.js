const addressService = require('../services/address.service');

exports.getAll = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user.id);
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

exports.save = async (req, res, next) => {
  try {
    const address = await addressService.createOrUpdateAddress(req.user.id, req.body);
    res.status(200).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

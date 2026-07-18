const deliveryPartnerService = require("../services/deliveryPartner.service");

exports.create = async (req, res, next) => {
  try {
    const deliveryPartner = await deliveryPartnerService.createPartner(req.user.id, req.body);
    res.status(201).json({ success: true, deliveryPartner });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const result = await deliveryPartnerService.listPartners(req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const deliveryPartner = await deliveryPartnerService.updatePartnerStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, deliveryPartner });
  } catch (error) {
    next(error);
  }
};

const ordersService = require('../services/orders.service');

exports.create = async (req, res, next) => {
  try {
    const isVendor = req.user.type === 'VENDOR';
    if (req.user.type === 'CLIENT') {
      req.body.clientId = req.user.id;
    }
    const order = await ordersService.createOrder(isVendor ? req.user.id : null, req.body);
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const isVendor = req.user.type === 'VENDOR';
    const orders = isVendor
      ? await ordersService.getOrders(req.user.id)
      : await ordersService.getClientOrders(req.user.id);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const isVendor = req.user.type === 'VENDOR';
    const order = isVendor
      ? await ordersService.getOrderById(req.user.id, req.params.id)
      : await ordersService.getClientOrderById(req.user.id, req.params.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus(req.user.vendorId || req.user.id, req.params.id, req.body.status);
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const agreementService = require('../services/agreementService');

exports.getAgreement = async (req, res, next) => {
  try {
    const agreement = await agreementService.generateOrderAgreement(req.params.id);
    res.status(200).json({ success: true, agreement });
  } catch (error) {
    next(error);
  }
};

exports.signAgreement = async (req, res, next) => {
  try {
    const { signatureData } = req.body;
    if (!signatureData) {
      return res.status(400).json({ success: false, message: 'Signature payload is required.' });
    }
    const order = await agreementService.recordAgreementSignature(req.params.id, signatureData, req.ip);
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

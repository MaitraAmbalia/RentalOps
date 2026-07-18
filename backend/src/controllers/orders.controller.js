const ordersService = require('../services/orders.service');

exports.create = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.user.vendorId || req.user.id, req.body);
    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const orders = await ordersService.getOrders(req.user.vendorId || req.user.id);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(req.user.vendorId || req.user.id, req.params.id);
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

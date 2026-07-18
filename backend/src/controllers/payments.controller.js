const paymentsService = require('../services/payments.service');

exports.initiate = async (req, res, next) => {
  try {
    const data = await paymentsService.initiatePayment(req.user.vendorId || req.user.id, req.params.orderId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.webhook = async (req, res, next) => {
  try {
    // Expected to receive payload & signature from Razorpay in real scenario
    const signature = req.headers['x-razorpay-signature'] || 'mock-signature';
    await paymentsService.verifyWebhook(req.body, signature);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const result = await paymentsService.verifyPayment(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

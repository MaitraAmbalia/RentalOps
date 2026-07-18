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
    // Pass the entire body; the service will extract the signature
    await paymentsService.verifyWebhook(req.body);
    res.status(200).json({ success: true, message: "Payment verified successfully" });
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

const service = require('../services/depositInvoices.service');

exports.getByOrderId = async (req, res, next) => {
  try {
    const deposit = await service.getDepositByOrderId(req.params.orderId);
    res.status(200).json({ success: true, deposit, depositInvoice: deposit });
  } catch (error) {
    next(error);
  }
};

exports.processRefund = async (req, res, next) => {
  try {
    const { penaltyAmountDeducted, razorpayRefundId } = req.body;
    const deposit = await service.processRefund(req.params.orderId, penaltyAmountDeducted, razorpayRefundId);
    res.status(200).json({ success: true, deposit, depositInvoice: deposit });
  } catch (error) {
    next(error);
  }
};

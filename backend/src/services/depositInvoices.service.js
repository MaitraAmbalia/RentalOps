const repo = require('../repositories/depositInvoice.repository');
const ApiError = require('../utils/apiError');
const { Prisma } = require('@prisma/client');

exports.getDepositByOrderId = async (orderId) => {
  const deposit = await repo.findByOrderId(orderId);
  if (!deposit) throw new ApiError(404, 'Security Deposit not found for this order');
  return deposit;
};

exports.processRefund = async (orderId, penaltyAmountDeducted, razorpayRefundId) => {
  const deposit = await repo.findByOrderId(orderId);
  if (!deposit) throw new ApiError(404, 'Security Deposit not found for this order');

  if (deposit.depositStatus === 'REFUNDED') {
    throw new ApiError(400, 'Deposit is already fully refunded');
  }

  // Calculate refund
  const originalAmount = parseFloat(deposit.depositAmount);
  const penalty = parseFloat(penaltyAmountDeducted || 0);
  
  if (penalty > originalAmount) {
    throw new ApiError(400, 'Penalty cannot exceed the original deposit amount');
  }

  const refundAmount = originalAmount - penalty;
  const status = penalty > 0 ? 'PARTIAL_REFUND' : 'REFUNDED';

  return await repo.updateDepositStatus(orderId, {
    depositStatus: status,
    penaltyAmountDeducted: penalty,
    refundedAmount: refundAmount,
    razorpayRefundId: razorpayRefundId,
    refundedAt: new Date()
  });
};

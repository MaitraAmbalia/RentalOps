const paymentRepo = require('../repositories/payment.repository');
const orderRepo = require('../repositories/order.repository');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// 1. Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

exports.initiatePayment = async (vendorId, orderId) => {
  const order = await orderRepo.findById(orderId, vendorId);
  if (!order) throw new ApiError(404, 'Order not found');

  const totalPayable = parseFloat(order.totalAmount) + parseFloat(order.securityDepositAmount);

  // MOCK: Generate a fake Razorpay Order ID for testing purposes
  const razorpayOrderId = `order_${crypto.randomBytes(6).toString('hex')}`;

  const payment = await paymentRepo.create({
    orderId: order.id,
    clientId: order.clientId,
    amount: totalPayable,
    razorpayOrderId: razorpayOrderId,
    status: 'CREATED'
  });

  return { payment, razorpayOrderId, amount: totalPayable };
};

exports.verifyWebhook = async (payload, signature) => {
  // MOCK: In a real integration, we'd verify the signature using crypto and RAZORPAY_WEBHOOK_SECRET
  // Assuming the payload contains the razorpay_order_id and payment details
  const { razorpay_order_id, razorpay_payment_id } = payload;
  
  const payment = await paymentRepo.findByRazorpayOrderId(razorpay_order_id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  // Mark local DB as paid
  await paymentRepo.markAsPaid(payment.id, razorpay_payment_id, signature);
  return { success: true };
};

exports.verifyPayment = async (data) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
  
  const payment = await paymentRepo.findByRazorpayOrderId(razorpay_order_id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  // Mark local DB as paid
  await paymentRepo.markAsPaid(payment.id, razorpay_payment_id, razorpay_signature);
  return { success: true };
};

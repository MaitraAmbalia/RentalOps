const paymentRepo = require('../repositories/payment.repository');
const orderRepo = require('../repositories/order.repository');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// 1. Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.initiatePayment = async (vendorId, orderId) => {
  const order = await orderRepo.findById(orderId, vendorId);
  if (!order) throw new ApiError(404, 'Order not found');

  const totalPayable = parseFloat(order.totalAmount) + parseFloat(order.securityDepositAmount);

  // 2. Create the Real Razorpay Order
  const options = {
    amount: Math.round(totalPayable * 100), // Razorpay expects amount in paise (smallest currency unit)
    currency: "INR",
    receipt: `receipt_order_${order.id.substring(0, 8)}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  // 3. Save the real razorpayOrderId to our database
  const payment = await paymentRepo.create({
    orderId: order.id,
    clientId: order.clientId,
    amount: totalPayable,
    razorpayOrderId: razorpayOrder.id,
    status: 'CREATED'
  });

  return { 
    payment, 
    razorpayOrderId: razorpayOrder.id, 
    amount: totalPayable,
    keyId: process.env.RAZORPAY_KEY_ID // Send the Key ID to the frontend to initialize the checkout modal
  };
};

exports.verifyWebhook = async (payload) => {
  // 4. Extract standard Razorpay signature parameters
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
  
  // 5. Compute our own signature using our Secret Key
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  // 6. Verify they match
  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Invalid payment signature');
  }
  
  const payment = await paymentRepo.findByRazorpayOrderId(razorpay_order_id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  // Mark local DB as paid
  await paymentRepo.markAsPaid(payment.id, razorpay_payment_id, razorpay_signature);
  return { success: true };
};

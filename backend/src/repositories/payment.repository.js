const { prisma } = require('../config/db');

exports.create = (data) => prisma.payment.create({ data });

exports.findByRazorpayOrderId = (razorpayOrderId) => prisma.payment.findUnique({
  where: { razorpayOrderId }
});

exports.markAsPaid = (id, razorpayPaymentId, razorpaySignature) => prisma.payment.update({
  where: { id },
  data: { 
    status: 'PAID', 
    razorpayPaymentId, 
    razorpaySignature, 
    paidAt: new Date() 
  }
});

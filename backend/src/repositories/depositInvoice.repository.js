const { prisma } = require('../config/db');

exports.findByOrderId = (orderId) => prisma.securityDepositInvoice.findUnique({
  where: { orderId },
  include: { order: true }
});

exports.updateDepositStatus = (orderId, data) => prisma.securityDepositInvoice.update({
  where: { orderId },
  data
});

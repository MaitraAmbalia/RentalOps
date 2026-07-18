const { prisma } = require('../config/db');

exports.create = (data) => prisma.order.create({ 
  data, 
  include: { items: true, depositInvoice: true } 
});

exports.findAllByVendor = (vendorId) => prisma.order.findMany({ 
  where: { vendorId },
  include: { client: true, payments: true }
});

exports.findAllByClient = (clientId) => prisma.order.findMany({ 
  where: { clientId },
  include: { payments: true }
});

exports.findById = (id, vendorId) => prisma.order.findFirst({ 
  where: { id, vendorId },
  include: { items: true, depositInvoice: true, payments: true }
});

exports.updateStatus = (id, status) => prisma.order.update({
  where: { id },
  data: { status }
});

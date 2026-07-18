const { prisma } = require('../config/db');

exports.create = (data) => prisma.quotation.create({
  data,
  include: { items: true }
});

exports.findAllByVendor = (vendorId) => prisma.quotation.findMany({
  where: { vendorId },
  include: { client: true, items: true }
});

exports.findAllByClient = (clientId) => prisma.quotation.findMany({
  where: { clientId },
  include: { vendor: true, items: true }
});

exports.findById = (id, vendorId) => prisma.quotation.findFirst({
  where: { id, vendorId },
  include: { client: true, items: { include: { product: true, productVariant: true } } }
});

exports.updateStatus = (id, status) => prisma.quotation.update({
  where: { id },
  data: { status }
});

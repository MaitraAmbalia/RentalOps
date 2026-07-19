const { prisma } = require('../config/db');

exports.create = (data) => prisma.quotation.create({
  data,
  include: { items: { include: { product: true, productVariant: true } }, client: true, vendor: true, category: true }
});

exports.findAllByVendor = (vendorId) => prisma.quotation.findMany({
  where: { vendorId },
  orderBy: { createdAt: 'desc' },
  include: { client: true, vendor: true, category: true, items: { include: { product: true, productVariant: true } } }
});

exports.findAllByClient = (clientId) => prisma.quotation.findMany({
  where: { clientId },
  orderBy: { createdAt: 'desc' },
  include: { vendor: true, category: true, items: { include: { product: true, productVariant: true } } }
});

exports.findById = (id, vendorId) => prisma.quotation.findFirst({
  where: vendorId ? { id, vendorId } : { id },
  include: { client: true, vendor: true, category: true, items: { include: { product: true, productVariant: true } } }
});

exports.update = (id, data) => prisma.quotation.update({
  where: { id },
  data,
  include: { items: { include: { product: true, productVariant: true } }, client: true, vendor: true, category: true }
});

exports.updateStatus = (id, status) => prisma.quotation.update({
  where: { id },
  data: { status }
});

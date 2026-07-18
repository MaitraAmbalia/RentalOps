const { prisma } = require('../config/db');

exports.create = (data) => prisma.quotationTemplate.create({ 
  data,
  include: { lines: true }
});

exports.findAllByVendor = (vendorId) => prisma.quotationTemplate.findMany({
  where: { vendorId },
  include: { lines: { include: { product: true } } }
});

exports.findById = (id, vendorId) => prisma.quotationTemplate.findFirst({
  where: { id, vendorId },
  include: { lines: { include: { product: true } } }
});

exports.delete = (id, vendorId) => prisma.quotationTemplate.deleteMany({
  where: { id, vendorId }
});

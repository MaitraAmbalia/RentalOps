const { prisma } = require('../config/db');

exports.findAllByVendor = (vendorId) => prisma.product.findMany({ 
  where: { vendorId },
  include: { category: true, attributes: { include: { attribute: true } } }
});

exports.findById = (id, vendorId) => prisma.product.findFirst({ 
  where: { id, vendorId },
  include: { 
    attributes: { include: { attribute: { include: { values: true } } } },
    variants: { include: { attributeValues: { include: { attributeValue: true } } } }
  }
});

exports.update = (id, data) => prisma.product.update({ where: { id }, data });
exports.remove = (id) => prisma.product.delete({ where: { id } });

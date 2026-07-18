const { prisma } = require('../config/db');

exports.findAllByVendor = (vendorId) => prisma.product.findMany({ 
  where: { vendorId },
  orderBy: { createdAt: 'desc' },
  include: { category: true, attributes: { include: { attribute: true } } }
});

exports.findAllPublished = (filters = {}) => {
  const where = { isPublished: true };
  if (filters.category && filters.category !== 'All') {
    where.category = { name: filters.category };
  }
  if (filters.maxPrice) {
    where.rentalPrice = { lte: parseFloat(filters.maxPrice) };
  }
  return prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { category: true, attributes: { include: { attribute: true } } }
  });
};

exports.findById = (id, vendorId) => prisma.product.findFirst({ 
  where: { id, vendorId },
  include: { 
    attributes: { include: { attribute: { include: { values: true } } } },
    variants: { include: { attributeValues: { include: { attributeValue: true } } } }
  }
});

exports.findPublishedById = (id) => prisma.product.findFirst({ 
  where: { id, isPublished: true },
  include: { 
    attributes: { include: { attribute: { include: { values: true } } } },
    variants: { include: { attributeValues: { include: { attributeValue: true } } } }
  }
});

exports.update = (id, data) => prisma.product.update({ where: { id }, data });
exports.remove = (id) => prisma.product.delete({ where: { id } });

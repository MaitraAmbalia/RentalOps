const { prisma } = require('../config/db');

exports.findAllByVendor = (vendorId) => prisma.product.findMany({ 
  where: { vendorId },
  orderBy: { createdAt: 'desc' },
  include: { category: true, attributes: { include: { attribute: true } } }
});

exports.findAllPublished = (filters = {}) => {
  const where = { isPublished: true, type: 'GOODS' };
  
  if (filters.category && filters.category !== 'All') {
    where.category = { name: filters.category };
  }
  
  if (filters.maxPrice) {
    where.rentalPrice = { lte: parseFloat(filters.maxPrice) };
  }

  if (filters.color) {
    where.color = filters.color;
  }

  if (filters.duration) {
    where.duration = filters.duration;
  }

  const incomingBrands = filters.brands || filters['brands[]'];
  if (incomingBrands) {
    let brandList = [];
    if (Array.isArray(incomingBrands)) {
      brandList = incomingBrands;
    } else if (typeof incomingBrands === 'string') {
      brandList = incomingBrands.split(',').map(b => b.trim()).filter(Boolean);
    } else if (typeof incomingBrands === 'object') {
      brandList = Object.values(incomingBrands);
    }
    if (brandList.length > 0) {
      where.brand = { in: brandList };
    }
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

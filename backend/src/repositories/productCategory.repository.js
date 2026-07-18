const { prisma } = require('../config/db');

exports.create = (data) => prisma.productCategory.create({ data });
exports.findAll = () => prisma.productCategory.findMany();
exports.findAllByVendor = (vendorId) => prisma.productCategory.findMany({ where: { vendorId } });
exports.findById = (id, vendorId) => prisma.productCategory.findFirst({ where: { id, vendorId } });
exports.update = (id, data) => prisma.productCategory.update({ where: { id }, data });
exports.remove = (id) => prisma.productCategory.delete({ where: { id } });

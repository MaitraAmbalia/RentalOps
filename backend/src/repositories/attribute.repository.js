const { prisma } = require('../config/db');

exports.create = (data) => prisma.attribute.create({ data, include: { values: true } });
exports.findAllByVendor = (vendorId) => prisma.attribute.findMany({ where: { vendorId }, include: { values: true } });
exports.findById = (id, vendorId) => prisma.attribute.findFirst({ where: { id, vendorId }, include: { values: true } });
exports.update = (id, data) => prisma.attribute.update({ where: { id }, data, include: { values: true } });
exports.remove = (id) => prisma.attribute.delete({ where: { id } });

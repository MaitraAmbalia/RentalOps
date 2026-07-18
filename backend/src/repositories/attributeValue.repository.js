const { prisma } = require('../config/db');

exports.create = (data) => prisma.attributeValue.create({ data });
exports.update = (id, data) => prisma.attributeValue.update({ where: { id }, data });
exports.remove = (id) => prisma.attributeValue.delete({ where: { id } });

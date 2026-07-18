// The variants are usually created via deep nested Prisma writes in the transaction, 
// but we keep this file as per structural requirements in backend.md
const { prisma } = require('../config/db');

exports.update = (id, data) => prisma.productVariant.update({ where: { id }, data });
exports.remove = (id) => prisma.productVariant.delete({ where: { id } });

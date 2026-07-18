const { prisma } = require('../config/db');

// File exists as requested by structural specs. Nested writes are preferred.
exports.remove = (id) => prisma.productAttributeValue.delete({ where: { id } });

const { prisma } = require('../config/db');

exports.create = (data) => prisma.supportQuery.create({
  data,
  include: { order: true, client: true }
});

exports.findMany = (where) => prisma.supportQuery.findMany({
  where,
  include: { order: true, client: true }
});

exports.findById = (id) => prisma.supportQuery.findUnique({
  where: { id },
  include: { order: true, client: true }
});

exports.updateStatus = (id, status) => prisma.supportQuery.update({
  where: { id },
  data: { status },
  include: { order: true, client: true }
});

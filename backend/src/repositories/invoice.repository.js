const { prisma } = require('../config/db');

exports.create = (data) => prisma.invoice.create({
  data,
  include: { lines: true }
});

exports.findMany = (where) => prisma.invoice.findMany({
  where,
  include: { order: true, lines: true }
});

exports.findById = (id) => prisma.invoice.findUnique({
  where: { id },
  include: { order: true, lines: true }
});

exports.updateState = (id, state, postedAt = null) => prisma.invoice.update({
  where: { id },
  data: { state, postedAt }
});

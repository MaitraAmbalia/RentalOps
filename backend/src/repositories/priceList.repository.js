const { prisma } = require("../config/db");

const create = async (vendorId, data) => {
  return prisma.priceList.create({
    data: { ...data, vendorId },
    include: { rules: true },
  });
};

const findAll = async () => {
  return prisma.priceList.findMany({
    orderBy: { createdAt: "desc" },
    include: { rules: true },
  });
};

const findById = async (id) => {
  return prisma.priceList.findUnique({
    where: { id },
    include: { rules: true },
  });
};

const update = async (id, data) => {
  return prisma.priceList.update({
    where: { id },
    data,
    include: { rules: true },
  });
};

module.exports = {
  create,
  findAll,
  findById,
  update,
};

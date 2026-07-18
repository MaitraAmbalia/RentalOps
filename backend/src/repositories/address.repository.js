const { prisma } = require("../config/db");

const create = async (clientId, data) => {
  return prisma.address.create({
    data: {
      ...data,
      clientId,
    },
  });
};

const findById = async (id) => {
  return prisma.address.findUnique({
    where: { id },
  });
};

const findByClientId = async (clientId) => {
  return prisma.address.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
};

const update = async (id, data) => {
  return prisma.address.update({
    where: { id },
    data,
  });
};

module.exports = {
  create,
  findById,
  findByClientId,
  update,
};

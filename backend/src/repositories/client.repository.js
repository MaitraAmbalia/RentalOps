const { prisma } = require("../config/db");

const create = async (data) => {
  return prisma.client.create({ data });
};

const findByEmail = async (email) => {
  return prisma.client.findUnique({ where: { email } });
};

const findById = async (id) => {
  return prisma.client.findUnique({ where: { id } });
};

const update = async (id, data) => {
  return prisma.client.update({
    where: { id },
    data,
  });
};

module.exports = {
  create,
  findByEmail,
  findById,
  update,
};

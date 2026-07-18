const { prisma } = require("../config/db");

const create = async (data) => {
  return prisma.vendor.create({ data });
};

const findByEmail = async (email) => {
  return prisma.vendor.findUnique({ where: { email } });
};

const findById = async (id) => {
  return prisma.vendor.findUnique({ where: { id } });
};

const update = async (id, data) => {
  return prisma.vendor.update({
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

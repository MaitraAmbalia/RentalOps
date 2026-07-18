const { prisma } = require("../config/db");

const create = async (data) => {
  return prisma.deliveryPartner.create({ data });
};

const findByPhone = async (phone) => {
  return prisma.deliveryPartner.findFirst({ where: { phone } });
};

const findById = async (id) => {
  return prisma.deliveryPartner.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });
};

const findByVendorId = async (vendorId) => {
  return prisma.deliveryPartner.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      currentStatus: true,
      currentOrderId: true,
      createdAt: true,
    },
  });
};

const update = async (id, data) => {
  return prisma.deliveryPartner.update({
    where: { id },
    data,
  });
};

module.exports = {
  create,
  findByPhone,
  findById,
  findByVendorId,
  update,
};

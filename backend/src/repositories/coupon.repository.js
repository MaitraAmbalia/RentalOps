const { prisma } = require("../config/db");

const create = async (vendorId, data) => {
  return prisma.coupon.create({
    data: { ...data, vendorId },
  });
};

const findByVendorId = async (vendorId) => {
  return prisma.coupon.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  });
};

const findById = async (id) => {
  return prisma.coupon.findUnique({ where: { id } });
};

const findByCodeAndVendor = async (code, vendorId) => {
  return prisma.coupon.findUnique({
    where: { vendorId_code: { vendorId, code } },
  });
};

const update = async (id, data) => {
  return prisma.coupon.update({
    where: { id },
    data,
  });
};

module.exports = {
  create,
  findByVendorId,
  findById,
  findByCodeAndVendor,
  update,
};

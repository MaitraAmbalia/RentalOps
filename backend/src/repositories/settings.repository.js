const { prisma } = require("../config/db");

const findByVendorId = async (vendorId) => {
  return prisma.vendorSettings.findUnique({
    where: { vendorId },
  });
};

const upsert = async (vendorId, data) => {
  return prisma.vendorSettings.upsert({
    where: { vendorId },
    update: data,
    create: {
      ...data,
      vendorId,
    },
  });
};

module.exports = {
  findByVendorId,
  upsert,
};

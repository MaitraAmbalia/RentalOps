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

const createRule = async (priceListId, ruleData) => {
  return prisma.priceListRule.create({
    data: {
      priceListId,
      productId: ruleData.productId || null,
      priceType: ruleData.priceType || "DISCOUNT",
      discountPercent: ruleData.discountPercent !== undefined ? Number(ruleData.discountPercent) : null,
      fixedPrice: ruleData.fixedPrice !== undefined ? Number(ruleData.fixedPrice) : null,
      minQty: ruleData.minQty !== undefined ? Number(ruleData.minQty) : 0,
      validFrom: ruleData.validFrom ? new Date(ruleData.validFrom) : null,
      validTo: ruleData.validTo ? new Date(ruleData.validTo) : null,
    }
  });
};

const deleteRule = async (ruleId) => {
  return prisma.priceListRule.delete({
    where: { id: ruleId }
  });
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  createRule,
  deleteRule,
};

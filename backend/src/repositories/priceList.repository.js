const { prisma } = require("../config/db");

const create = async (vendorId, data) => {
  return prisma.priceList.create({
    data: { ...data, vendorId },
    include: { rules: { include: { product: true } } },
  });
};

const findAll = async (vendorId) => {
  return prisma.priceList.findMany({
    where: vendorId ? { vendorId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { rules: { include: { product: true } } },
  });
};

const findById = async (id) => {
  return prisma.priceList.findUnique({
    where: { id },
    include: { rules: { include: { product: true } } },
  });
};

const update = async (id, data) => {
  return prisma.priceList.update({
    where: { id },
    data,
    include: { rules: { include: { product: true } } },
  });
};

const createRule = async (priceListId, ruleData) => {
  const isDiscount = ruleData.priceType === "DISCOUNT";
  return prisma.priceListRule.create({
    data: {
      priceListId,
      productId: ruleData.productId || null,
      priceType: ruleData.priceType || "DISCOUNT",
      discountPercent: isDiscount && ruleData.discountPercent !== undefined && ruleData.discountPercent !== null ? Number(ruleData.discountPercent) : null,
      fixedPrice: !isDiscount && ruleData.fixedPrice !== undefined && ruleData.fixedPrice !== null ? Number(ruleData.fixedPrice) : null,
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

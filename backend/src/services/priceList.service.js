const priceListRepository = require("../repositories/priceList.repository");
const ApiError = require("../utils/apiError");

const createPriceList = async (vendorId, data) => {
  return priceListRepository.create(vendorId, data);
};

const getPriceLists = async (vendorId) => {
  return priceListRepository.findAll(vendorId);
};

const updatePriceList = async (id, vendorId, data) => {
  const priceList = await priceListRepository.findById(id);
  if (!priceList) {
    throw new ApiError(404, "Price list not found");
  }
  if (priceList.vendorId !== vendorId) {
    throw new ApiError(403, "Forbidden");
  }
  return priceListRepository.update(id, data);
};

const addRule = async (priceListId, vendorId, ruleData) => {
  const priceList = await priceListRepository.findById(priceListId);
  if (!priceList) {
    throw new ApiError(404, "Price list not found");
  }
  if (priceList.vendorId !== vendorId) {
    throw new ApiError(403, "Forbidden");
  }
  return priceListRepository.createRule(priceListId, ruleData);
};

const removeRule = async (priceListId, ruleId, vendorId) => {
  const priceList = await priceListRepository.findById(priceListId);
  if (!priceList) {
    throw new ApiError(404, "Price list not found");
  }
  if (priceList.vendorId !== vendorId) {
    throw new ApiError(403, "Forbidden");
  }
  return priceListRepository.deleteRule(ruleId);
};

const { prisma } = require("../config/db");

const deletePriceList = async (id, vendorId) => {
  const priceList = await priceListRepository.findById(id);
  if (!priceList) {
    throw new ApiError(404, "Price list not found");
  }
  if (priceList.vendorId !== vendorId) {
    throw new ApiError(403, "Forbidden");
  }

  // Reset defaultPriceListId if this price list was set as default
  await prisma.vendorSettings.updateMany({
    where: { vendorId, defaultPriceListId: id },
    data: { defaultPriceListId: null }
  });

  return priceListRepository.deletePriceList(id);
};

module.exports = {
  createPriceList,
  getPriceLists,
  updatePriceList,
  addRule,
  removeRule,
  deletePriceList,
};

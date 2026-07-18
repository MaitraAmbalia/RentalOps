const priceListRepository = require("../repositories/priceList.repository");
const ApiError = require("../utils/apiError");

const createPriceList = async (vendorId, data) => {
  return priceListRepository.create(vendorId, data);
};

const getPriceLists = async () => {
  return priceListRepository.findAll();
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

module.exports = {
  createPriceList,
  getPriceLists,
  updatePriceList,
};

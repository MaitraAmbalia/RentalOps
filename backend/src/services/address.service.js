const addressRepository = require("../repositories/address.repository");
const ApiError = require("../utils/apiError");

const getAddresses = async (clientId) => {
  return addressRepository.findByClientId(clientId);
};

const createOrUpdateAddress = async (clientId, data) => {
  const { id, ...addressData } = data;
  
  if (id) {
    // Perform update
    const address = await addressRepository.findById(id);
    if (!address) {
      throw new ApiError(404, "Address not found");
    }
    if (address.clientId !== clientId) {
      throw new ApiError(403, "Forbidden");
    }
    return addressRepository.update(id, addressData);
  }
  
  // Perform creation
  return addressRepository.create(clientId, addressData);
};

module.exports = {
  getAddresses,
  createOrUpdateAddress,
};

const clientRepository = require("../repositories/client.repository");
const ApiError = require("../utils/apiError");

const getProfile = async (clientId) => {
  const client = await clientRepository.findById(clientId);
  if (!client) {
    throw new ApiError(404, "Client not found");
  }
  const { passwordHash, ...safeClient } = client;
  return safeClient;
};

const updateProfile = async (clientId, data) => {
  const client = await clientRepository.findById(clientId);
  if (!client) {
    throw new ApiError(404, "Client not found");
  }
  const updatedClient = await clientRepository.update(clientId, data);
  const { passwordHash, ...safeClient } = updatedClient;
  return safeClient;
};

module.exports = {
  getProfile,
  updateProfile,
};

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

const bcrypt = require("bcrypt");
const { prisma } = require("../config/db");

const changePassword = async (clientId, { oldPassword, newPassword }) => {
  const client = await clientRepository.findById(clientId);
  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, client.passwordHash);
  if (!isMatch) {
    throw new ApiError(400, "Incorrect current password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.client.update({
    where: { id: clientId },
    data: { passwordHash }
  });

  return { success: true };
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};

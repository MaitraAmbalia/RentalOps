const bcrypt = require("bcrypt");
const deliveryPartnerRepository = require("../repositories/deliveryPartner.repository");
const ApiError = require("../utils/apiError");

const SALT_ROUNDS = 10;

const createPartner = async (vendorId, data) => {
  const existing = await deliveryPartnerRepository.findByPhone(data.phone);
  if (existing) {
    throw new ApiError(409, "A delivery partner with this phone already exists");
  }

  const plainPassword = data.password || "password123";
  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const partner = await deliveryPartnerRepository.create({
    vendorId,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    companyName: data.companyName || null,
    passwordHash,
  });

  const { passwordHash: _, ...safePartner } = partner;
  return safePartner;
};

const listPartners = async (vendorId) => {
  const partners = await deliveryPartnerRepository.findByVendorId(vendorId);
  return { deliveryPartners: partners, total: partners.length };
};

const updatePartnerStatus = async (id, status) => {
  const partner = await deliveryPartnerRepository.findById(id);
  if (!partner) {
    throw new ApiError(404, "Delivery partner not found");
  }
  const updated = await deliveryPartnerRepository.update(id, { currentStatus: status });
  const { passwordHash: _, ...safePartner } = updated;
  return safePartner;
};

module.exports = {
  createPartner,
  listPartners,
  updatePartnerStatus,
};

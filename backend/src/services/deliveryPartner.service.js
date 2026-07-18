const bcrypt = require("bcrypt");
const deliveryPartnerRepository = require("../repositories/deliveryPartner.repository");
const ApiError = require("../utils/apiError");

const SALT_ROUNDS = 10;

const createPartner = async (vendorId, data) => {
  const existing = await deliveryPartnerRepository.findByPhone(data.phone);
  if (existing) {
    throw new ApiError(409, "A delivery partner with this phone already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const partner = await deliveryPartnerRepository.create({
    vendorId,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    passwordHash,
  });

  const { passwordHash: _, ...safePartner } = partner;
  return safePartner;
};

const listPartners = async (vendorId) => {
  const partners = await deliveryPartnerRepository.findByVendorId(vendorId);
  return { deliveryPartners: partners, total: partners.length };
};

module.exports = {
  createPartner,
  listPartners,
};

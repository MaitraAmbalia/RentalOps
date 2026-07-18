const vendorRepository = require("../repositories/vendor.repository");
const settingsRepository = require("../repositories/settings.repository");
const ApiError = require("../utils/apiError");

const getProfile = async (vendorId) => {
  const vendor = await vendorRepository.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }
  const { passwordHash, ...safeVendor } = vendor;
  return safeVendor;
};

const updateProfile = async (vendorId, data) => {
  const vendor = await vendorRepository.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }
  const updatedVendor = await vendorRepository.update(vendorId, data);
  const { passwordHash, ...safeVendor } = updatedVendor;
  return safeVendor;
};

const getSettings = async (vendorId) => {
  let settings = await settingsRepository.findByVendorId(vendorId);
  if (!settings) {
    // Upsert with default settings values
    settings = await settingsRepository.upsert(vendorId, {
      lateFeeEnabled: true,
      defaultLateFeeRatePerHour: 0,
      lateFeeGracePeriodMinutes: 0,
      defaultDepositCalcType: "PERCENT_OF_RENTAL",
      defaultDepositValue: 100,
      defaultTaxPercent: 0,
    });
  }
  return settings;
};

const updateSettings = async (vendorId, data) => {
  // Ensure the settings record exists first
  await getSettings(vendorId);
  return settingsRepository.upsert(vendorId, data);
};

const bcrypt = require("bcrypt");
const { prisma } = require("../config/db");

const changePassword = async (vendorId, { oldPassword, newPassword }) => {
  const vendor = await vendorRepository.findById(vendorId);
  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const isMatch = await bcrypt.compare(oldPassword, vendor.passwordHash);
  if (!isMatch) {
    throw new ApiError(400, "Incorrect current password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { passwordHash }
  });

  return { success: true };
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  changePassword,
};

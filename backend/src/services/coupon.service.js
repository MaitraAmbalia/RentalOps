const couponRepository = require("../repositories/coupon.repository");
const ApiError = require("../utils/apiError");

const createCoupon = async (vendorId, data) => {
  const existing = await couponRepository.findByCodeAndVendor(data.code, vendorId);
  if (existing) {
    throw new ApiError(409, "A coupon with this code already exists");
  }
  return couponRepository.create(vendorId, data);
};

const getCoupons = async (vendorId) => {
  return couponRepository.findByVendorId(vendorId);
};

const updateCoupon = async (id, vendorId, data) => {
  const coupon = await couponRepository.findById(id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  if (coupon.vendorId !== vendorId) throw new ApiError(403, "Forbidden");
  return couponRepository.update(id, data);
};

const validateCoupon = async (code, vendorId) => {
  const coupon = await couponRepository.findByCodeAndVendor(code, vendorId);
  if (!coupon) throw new ApiError(400, "Invalid coupon code");
  return coupon;
};

module.exports = {
  createCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
};

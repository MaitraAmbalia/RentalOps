const couponService = require("../services/coupon.service");

exports.getAll = async (req, res, next) => {
  try {
    const coupons = await couponService.getCoupons(req.user.id);
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.user.id, req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

exports.validate = async (req, res, next) => {
  try {
    const coupon = await couponService.validateCoupon(req.body.code, req.body.vendorId);
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

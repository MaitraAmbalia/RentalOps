const ApiError = require("../utils/apiError");

const scopeToVendor = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Unauthorized"));
  }

  if (req.user.type === "VENDOR") {
    req.vendorId = req.user.id;
  } else if (req.user.type === "DELIVERY") {
    req.vendorId = req.user.vendorId;
  } else {
    req.vendorId = null;
  }
  next();
};

module.exports = scopeToVendor;

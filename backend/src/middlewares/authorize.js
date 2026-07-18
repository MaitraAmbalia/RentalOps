const ApiError = require("../utils/apiError");

const authorize = (...types) => (req, res, next) => {
  if (!req.user || !types.includes(req.user.type)) {
    return next(new ApiError(403, "Forbidden"));
  }
  next();
};

module.exports = authorize;

const { verifyAccessToken } = require("../utils/tokens");
const ApiError = require("../utils/apiError");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token is required"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      type: decoded.type,
      vendorId: decoded.vendorId || null,
    };
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
};

module.exports = authenticate;

const { verifyAccessToken } = require("../utils/tokens");

const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.id,
      type: decoded.type,
      role: decoded.type,
      vendorId: decoded.vendorId || null,
    };
  } catch (error) {
    // Optional, so we just ignore invalid tokens and treat as unauthenticated
  }
  next();
};

module.exports = optionalAuthenticate;

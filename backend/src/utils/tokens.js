const jwt = require("jsonwebtoken");
const env = require("../config/env");

const crypto = require("crypto");

const generateAccessToken = (payload) => {
  // payload should include: { id, type, vendorId }
  const signPayload = {
    id: payload.id,
    type: payload.type,
  };
  if (payload.vendorId) {
    signPayload.vendorId = payload.vendorId;
  }
  return jwt.sign(signPayload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (payload) => {
  // payload should include: { id, type }
  return jwt.sign(
    {
      id: payload.id,
      type: payload.type,
      jti: crypto.randomUUID(),
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",       // "lax" allows the cookie to be sent cross-origin (5173 → 5000)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};

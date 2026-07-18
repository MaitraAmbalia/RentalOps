const bcrypt = require("bcrypt");
const vendorRepository = require("../repositories/vendor.repository");
const clientRepository = require("../repositories/client.repository");
const deliveryPartnerRepository = require("../repositories/deliveryPartner.repository");
const refreshTokenRepository = require("../repositories/refreshToken.repository");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");
const ApiError = require("../utils/apiError");

const SALT_ROUNDS = 10;

/**
 * Register a new Vendor
 */
const registerVendor = async (data) => {
  const existingVendor = await vendorRepository.findByEmail(data.email);
  if (existingVendor) {
    throw new ApiError(409, "A vendor with this email already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  // Exclude password and confirmPassword from the data to save
  const { password, confirmPassword, ...vendorData } = data;

  const vendor = await vendorRepository.create({
    ...vendorData,
    passwordHash,
  });

  // Exclude passwordHash from returned object
  const { passwordHash: _, ...safeVendor } = vendor;
  return safeVendor;
};

/**
 * Login Vendor
 */
const loginVendor = async (email, password) => {
  const vendor = await vendorRepository.findByEmail(email);
  if (!vendor) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!vendor.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  const isPasswordValid = await bcrypt.compare(password, vendor.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken({
    id: vendor.id,
    type: "VENDOR",
  });

  const refreshToken = generateRefreshToken({
    id: vendor.id,
    type: "VENDOR",
  });

  // Save refresh token to db
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await refreshTokenRepository.create({
    token: refreshToken,
    subjectId: vendor.id,
    subjectType: "VENDOR",
    expiresAt,
  });

  const { passwordHash: _, ...safeVendor } = vendor;

  return {
    vendor: safeVendor,
    accessToken,
    refreshToken,
  };
};

/**
 * Register a new Client
 */
const registerClient = async (data) => {
  const existingClient = await clientRepository.findByEmail(data.email);
  if (existingClient) {
    throw new ApiError(409, "A client with this email already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const { password, confirmPassword, couponCode, ...clientData } = data;

  const client = await clientRepository.create({
    ...clientData,
    passwordHash,
  });

  const { passwordHash: _, ...safeClient } = client;
  return safeClient;
};

/**
 * Login Client
 */
const loginClient = async (email, password) => {
  const client = await clientRepository.findByEmail(email);
  if (!client) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, client.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken({
    id: client.id,
    type: "CLIENT",
  });

  const refreshToken = generateRefreshToken({
    id: client.id,
    type: "CLIENT",
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await refreshTokenRepository.create({
    token: refreshToken,
    subjectId: client.id,
    subjectType: "CLIENT",
    expiresAt,
  });

  const { passwordHash: _, ...safeClient } = client;

  return {
    client: safeClient,
    accessToken,
    refreshToken,
  };
};

/**
 * Login Delivery Partner (using phone)
 */
const loginDelivery = async (phone, password) => {
  const deliveryPartner = await deliveryPartnerRepository.findByPhone(phone);
  if (!deliveryPartner) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  const isPasswordValid = await bcrypt.compare(password, deliveryPartner.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  // Delivery partner needs vendorId in accessToken payload
  const accessToken = generateAccessToken({
    id: deliveryPartner.id,
    type: "DELIVERY",
    vendorId: deliveryPartner.vendorId,
  });

  const refreshToken = generateRefreshToken({
    id: deliveryPartner.id,
    type: "DELIVERY",
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await refreshTokenRepository.create({
    token: refreshToken,
    subjectId: deliveryPartner.id,
    subjectType: "DELIVERY",
    expiresAt,
  });

  const { passwordHash: _, ...safeDeliveryPartner } = deliveryPartner;

  return {
    deliveryPartner: safeDeliveryPartner,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh Tokens (with Token Rotation)
 */
const refreshTokens = async (token) => {
  if (!token) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const dbToken = await refreshTokenRepository.findByToken(token);
  if (!dbToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  // Token reuse detection: if token is already revoked, revoke all tokens for this subject
  if (dbToken.revoked) {
    await refreshTokenRepository.revokeAllForSubject(dbToken.subjectId, dbToken.subjectType);
    throw new ApiError(401, "Compromised session. All sessions revoked");
  }

  if (new Date() > dbToken.expiresAt) {
    throw new ApiError(401, "Refresh token has expired");
  }

  // Create new tokens
  const payload = {
    id: dbToken.subjectId,
    type: dbToken.subjectType,
  };

  // If type is DELIVERY, we need to load the vendorId
  if (dbToken.subjectType === "DELIVERY") {
    const partner = await deliveryPartnerRepository.findById(dbToken.subjectId);
    if (partner) {
      payload.vendorId = partner.vendorId;
    }
  }

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken({
    id: dbToken.subjectId,
    type: dbToken.subjectType,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Transaction-like update: mark old token as replaced, and create new one
  await refreshTokenRepository.update(dbToken.id, {
    revoked: true,
    replacedBy: newRefreshToken,
  });

  await refreshTokenRepository.create({
    token: newRefreshToken,
    subjectId: dbToken.subjectId,
    subjectType: dbToken.subjectType,
    expiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Logout
 */
const logout = async (token) => {
  if (!token) return;
  const dbToken = await refreshTokenRepository.findByToken(token);
  if (dbToken) {
    await refreshTokenRepository.update(dbToken.id, { revoked: true });
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (id, type) => {
  let user = null;
  if (type === "VENDOR") {
    user = await vendorRepository.findById(id);
  } else if (type === "CLIENT") {
    user = await clientRepository.findById(id);
  } else if (type === "DELIVERY") {
    user = await deliveryPartnerRepository.findById(id);
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Exclude sensitive details
  const { passwordHash: _, ...safeUser } = user;
  return {
    type,
    user: safeUser,
  };
};

/**
 * Verify if email exists
 */
const verifyEmailExists = async (email) => {
  const client = await clientRepository.findByEmail(email);
  if (client) return true;
  const vendor = await vendorRepository.findByEmail(email);
  if (vendor) return true;
  return false;
};

module.exports = {
  registerVendor,
  loginVendor,
  registerClient,
  loginClient,
  loginDelivery,
  refreshTokens,
  logout,
  getCurrentUser,
  verifyEmailExists,
};

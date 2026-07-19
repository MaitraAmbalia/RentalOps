const authService = require("../services/auth.service");
const { ok } = require("../utils/apiResponse");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/tokens");

const registerVendor = async (req, res, next) => {
  try {
    const vendor = await authService.registerVendor(req.body);
    return ok(res, { vendor }, 201);
  } catch (error) {
    next(error);
  }
};

const loginVendor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { vendor, accessToken, refreshToken } = await authService.loginVendor(
      email,
      password
    );

    setRefreshTokenCookie(res, refreshToken);
    return ok(res, { accessToken, vendor });
  } catch (error) {
    next(error);
  }
};

const registerClient = async (req, res, next) => {
  try {
    const client = await authService.registerClient(req.body);
    return ok(res, { client }, 201);
  } catch (error) {
    next(error);
  }
};

const loginClient = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { client, accessToken, refreshToken } = await authService.loginClient(
      email,
      password
    );

    setRefreshTokenCookie(res, refreshToken);
    return ok(res, { accessToken, client });
  } catch (error) {
    next(error);
  }
};

const loginDelivery = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const { deliveryPartner, accessToken, refreshToken } =
      await authService.loginDelivery(phone, password);

    setRefreshTokenCookie(res, refreshToken);
    return ok(res, { accessToken, deliveryPartner });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    // Read refresh token from cookie
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshTokens(token);

    setRefreshTokenCookie(res, newRefreshToken);
    return ok(res, { accessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    await authService.logout(token);
    clearRefreshTokenCookie(res);
    return ok(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const { id, type } = req.user;
    const currentUser = await authService.getCurrentUser(id, type);
    return ok(res, currentUser);
  } catch (error) {
    next(error);
  }
};


const requestReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    return ok(res, result);
  } catch (error) {
    next(error);
  }
};

const confirmReset = async (req, res, next) => {
  try {
    const { email, token, newPassword, type } = req.body;
    const result = await authService.confirmPasswordReset(email, token, newPassword, type);
    return ok(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestReset,
  confirmReset,
  registerVendor,
  loginVendor,
  registerClient,
  loginClient,
  loginDelivery,
  refresh,
  logout,
  me,
};

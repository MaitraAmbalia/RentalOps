const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/authenticate");
const {
  registerVendorSchema,
  registerClientSchema,
  vendorLoginSchema,
  clientLoginSchema,
  deliveryLoginSchema,
} = require("../validators/auth.schema");

// Vendor Auth
router.post(
  "/vendor/register",
  validate(registerVendorSchema),
  authController.registerVendor
);
router.post(
  "/vendor/login",
  validate(vendorLoginSchema),
  authController.loginVendor
);

// Client Auth
router.post(
  "/client/register",
  validate(registerClientSchema),
  authController.registerClient
);
router.post(
  "/client/login",
  validate(clientLoginSchema),
  authController.loginClient
);

// Delivery Partner Auth
router.post(
  "/delivery/login",
  validate(deliveryLoginSchema),
  authController.loginDelivery
);

// General Auth
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

module.exports = router;

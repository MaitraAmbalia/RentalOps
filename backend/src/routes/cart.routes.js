const { Router } = require("express");
const controller = require("../controllers/cart.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const {
  cartItemSchema,
  updateCartItemSchema,
  saveForLaterSchema,
  applyCouponSchema,
} = require("../validators/cart.schema");

const router = Router();

router.use(authenticate, authorize("CLIENT"));

router.get("/", controller.getCart);
router.post("/items", validate(cartItemSchema), controller.addItem);
router.patch("/items/:id", validate(updateCartItemSchema), controller.updateItem);
router.patch("/items/:id/save-for-later", validate(saveForLaterSchema), controller.saveForLater);
router.delete("/items/:id", controller.removeItem);
router.post("/apply-coupon", validate(applyCouponSchema), controller.applyCoupon);

module.exports = router;

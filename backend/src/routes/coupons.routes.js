    const { Router } = require("express");
const controller = require("../controllers/coupon.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { couponSchema, validateCouponSchema } = require("../validators/coupon.schema");

const router = Router();

router.get("/", authenticate, authorize("VENDOR"), controller.getAll);
router.post("/", authenticate, authorize("VENDOR"), validate(couponSchema), controller.create);
router.patch("/:id", authenticate, authorize("VENDOR"), validate(couponSchema.partial()), controller.update);
router.post("/validate", validate(validateCouponSchema), controller.validate);  // Public

module.exports = router;

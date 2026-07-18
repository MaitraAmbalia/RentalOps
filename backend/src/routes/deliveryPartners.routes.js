const { Router } = require("express");
const controller = require("../controllers/deliveryPartner.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createDeliveryPartnerSchema } = require("../validators/deliveryPartner.schema");

const router = Router();

router.use(authenticate, authorize("VENDOR"));

router.post("/", validate(createDeliveryPartnerSchema), controller.create);
router.get("/", controller.list);

module.exports = router;

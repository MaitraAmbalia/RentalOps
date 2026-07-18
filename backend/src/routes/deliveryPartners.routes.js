const { Router } = require("express");
const controller = require("../controllers/deliveryPartner.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createDeliveryPartnerSchema } = require("../validators/deliveryPartner.schema");

const router = Router();

router.use(authenticate);

router.post("/", authorize("VENDOR"), validate(createDeliveryPartnerSchema), controller.create);
router.get("/", authorize("VENDOR"), controller.list);
router.patch("/:id/status", authorize("VENDOR", "DELIVERY"), controller.updateStatus);

module.exports = router;

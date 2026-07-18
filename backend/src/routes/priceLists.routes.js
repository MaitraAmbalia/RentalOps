const { Router } = require("express");
const controller = require("../controllers/priceList.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { priceListSchema } = require("../validators/priceList.schema");

const router = Router();

router.get("/", controller.getAll);                                               // Public
router.post("/", authenticate, authorize("VENDOR"), validate(priceListSchema), controller.create);
router.patch("/:id", authenticate, authorize("VENDOR"), validate(priceListSchema.partial()), controller.update);
router.post("/:priceListId/rules", authenticate, authorize("VENDOR"), controller.addRule);
router.delete("/:priceListId/rules/:ruleId", authenticate, authorize("VENDOR"), controller.deleteRule);

module.exports = router;

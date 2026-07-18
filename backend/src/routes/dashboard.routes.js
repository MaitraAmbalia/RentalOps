const { Router } = require("express");
const controller = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = Router();

// Scoped to VENDOR only
router.use(authenticate, authorize("VENDOR"));

router.get("/", controller.getStats);
router.get("/summary", controller.getSummary);
router.get("/active-rentals", controller.getActiveRentals);
router.get("/overdue", controller.getOverdueRentals);
router.get("/revenue", controller.getRevenueSeries);

module.exports = router;

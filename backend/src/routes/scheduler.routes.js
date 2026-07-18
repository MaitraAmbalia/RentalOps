const { Router } = require("express");
const controller = require("../controllers/scheduler.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = Router();

// Only VENDORs have access to the rental scheduler calendar
router.use(authenticate, authorize("VENDOR"));

router.get("/", controller.getMonthly);
router.get("/day", controller.getDay);
router.get("/range", controller.getRange);

module.exports = router;

const { Router } = require("express");
const controller = require("../controllers/notification.controller");
const authenticate = require("../middlewares/authenticate");

const router = Router();

router.use(authenticate);

router.get("/", controller.getNotifications);
router.patch("/read-all", controller.markAllAsRead);
router.post("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);
router.post("/:id/read", controller.markAsRead);

module.exports = router;

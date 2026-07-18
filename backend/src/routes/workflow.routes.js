const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const controller = require("../controllers/workflow.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { createWorkflowSchema, completeWorkflowSchema } = require("../validators/workflow.schema");

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Config Multer for damage images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `damage-${req.user.id}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

router.use(authenticate);

// 1. Create Workflow (VENDOR only)
router.post(
  "/",
  authorize("VENDOR"),
  validate(createWorkflowSchema),
  controller.create
);

// 2. Get All Workflows (VENDOR / DELIVERY)
router.get(
  "/",
  authorize("VENDOR", "DELIVERY"),
  controller.getAll
);

// 3. Get Workflow By ID (VENDOR / DELIVERY)
router.get(
  "/:id",
  authorize("VENDOR", "DELIVERY"),
  controller.getById
);

// 4. Update Route Sequence (VENDOR only)
router.patch(
  "/:id/route",
  authorize("VENDOR"),
  controller.updateRoute
);

// 5. Notify Customer (VENDOR only)
router.patch(
  "/:id/notify",
  authorize("VENDOR"),
  controller.notify
);

// 6. Scan QR Code (DELIVERY only)
router.patch(
  "/:id/scan",
  authorize("DELIVERY"),
  controller.scan
);

// 7. Complete Workflow (DELIVERY or VENDOR)
router.patch(
  "/:id/complete",
  authorize("DELIVERY", "VENDOR"),
  upload.array("damageImages", 5),
  validate(completeWorkflowSchema),
  controller.complete
);

// 8. Update Workflow status/assignment (VENDOR / DELIVERY)
router.patch(
  "/:id/status",
  authorize("VENDOR", "DELIVERY"),
  controller.updateStatus
);

module.exports = router;

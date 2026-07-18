const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authenticate = require("../middlewares/authenticate");
const ApiError = require("../utils/apiError");

const router = Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only images (JPEG, JPG, PNG, GIF, WEBP) and PDFs are allowed"));
    }
  },
});

router.post("/", authenticate, upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, url });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

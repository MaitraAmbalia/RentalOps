const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const clientController = require('../controllers/client.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { updateClientSchema } = require('../validators/client.schema');

const router = Router();

// Ensure uploads folder exists in workspace backend root
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

router.get('/', authenticate, authorize('VENDOR'), clientController.getAll);

// Authenticated CLIENT only
router.use(authenticate, authorize('CLIENT'));

router.get('/me', clientController.getProfile);
router.patch('/me', validate(updateClientSchema), clientController.updateProfile);
router.post('/me/avatar', upload.single('avatar'), clientController.uploadAvatar);
router.patch('/me/change-password', clientController.changePassword);

module.exports = router;

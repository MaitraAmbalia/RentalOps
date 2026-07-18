const { Router } = require('express');
const vendorController = require('../controllers/vendor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { updateVendorSchema } = require('../validators/vendor.schema');

const router = Router();

// Scoped to VENDOR
router.use(authenticate, authorize('VENDOR'));

router.get('/me', vendorController.getProfile);
router.patch('/me', validate(updateVendorSchema), vendorController.updateProfile);
router.patch('/me/change-password', vendorController.changePassword);

module.exports = router;

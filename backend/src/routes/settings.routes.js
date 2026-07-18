const { Router } = require('express');
const vendorController = require('../controllers/vendor.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { settingsSchema } = require('../validators/vendor.schema');

const router = Router();

// Scoped to VENDOR
router.use(authenticate, authorize('VENDOR'));

router.get('/', vendorController.getSettings);
router.patch('/', validate(settingsSchema.partial()), vendorController.updateSettings);

module.exports = router;

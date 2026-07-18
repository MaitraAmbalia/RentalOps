const { Router } = require('express');
const addressController = require('../controllers/address.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { addressSchema } = require('../validators/address.schema');

const router = Router();

// Enforced CLIENT role only
router.use(authenticate, authorize('CLIENT'));

router.get('/', addressController.getAll);
router.post('/', validate(addressSchema), addressController.save);

module.exports = router;

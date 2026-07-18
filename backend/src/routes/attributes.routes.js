const { Router } = require('express');
const attributesController = require('../controllers/attributes.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { attributeSchema, attributeValueSchema } = require('../validators/attributes.schema');

const router = Router();

router.use(authenticate, authorize('VENDOR'));

router.post('/', validate(attributeSchema), attributesController.create);
router.get('/', attributesController.getAll);
router.patch('/:id', validate(attributeSchema.partial()), attributesController.update);
router.delete('/:id', attributesController.remove);

// Nested routes for managing attribute values individually
router.post('/:id/values', validate(attributeValueSchema), attributesController.addValue);
router.delete('/:id/values/:valueId', attributesController.removeValue);

module.exports = router;

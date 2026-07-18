const { Router } = require('express');
const productsController = require('../controllers/products.controller');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { productSchema } = require('../validators/products.schema');

const router = Router();

router.post('/', authenticate, authorize('VENDOR'), validate(productSchema), productsController.create);
router.get('/', optionalAuthenticate, productsController.getAll);
router.get('/:id', optionalAuthenticate, productsController.getById);
router.patch('/:id', authenticate, authorize('VENDOR'), validate(productSchema.partial()), productsController.update);
router.delete('/:id', authenticate, authorize('VENDOR'), productsController.remove);

module.exports = router;

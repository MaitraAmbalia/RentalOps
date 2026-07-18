const { Router } = require('express');
const productsController = require('../controllers/products.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { productSchema } = require('../validators/products.schema');

const router = Router();

// Public routes for clients to view products could be separated or conditional, 
// but sticking to vendor management context here.
router.use(authenticate);

router.post('/', authorize('VENDOR'), validate(productSchema), productsController.create);
router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);
router.patch('/:id', authorize('VENDOR'), validate(productSchema.partial()), productsController.update);
router.delete('/:id', authorize('VENDOR'), productsController.remove);

module.exports = router;

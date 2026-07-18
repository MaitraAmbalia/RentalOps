const { Router } = require('express');
const categoriesController = require('../controllers/categories.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { categorySchema } = require('../validators/categories.schema');

const router = Router();

// Only VENDORs can manage categories
router.use(authenticate, authorize('VENDOR'));

router.post('/', validate(categorySchema), categoriesController.create);
router.get('/', categoriesController.getAll);
router.patch('/:id', validate(categorySchema.partial()), categoriesController.update);
router.delete('/:id', categoriesController.remove);

module.exports = router;

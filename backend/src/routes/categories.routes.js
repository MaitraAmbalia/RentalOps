const { Router } = require('express');
const categoriesController = require('../controllers/categories.controller');
const authenticate = require('../middlewares/authenticate');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { categorySchema } = require('../validators/categories.schema');

const router = Router();

router.post('/', authenticate, authorize('VENDOR'), validate(categorySchema), categoriesController.create);
router.get('/', optionalAuthenticate, categoriesController.getAll);
router.patch('/:id', authenticate, authorize('VENDOR'), validate(categorySchema.partial()), categoriesController.update);
router.delete('/:id', authenticate, authorize('VENDOR'), categoriesController.remove);

module.exports = router;

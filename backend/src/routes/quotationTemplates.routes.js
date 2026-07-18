const { Router } = require('express');
const controller = require('../controllers/quotationTemplates.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { quotationTemplateSchema } = require('../validators/quotationTemplates.schema');

const router = Router();

router.use(authenticate);
router.use(authorize('VENDOR')); // Templates are managed by Vendors

router.post('/', validate(quotationTemplateSchema), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.delete('/:id', controller.delete);

module.exports = router;

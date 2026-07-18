const { Router } = require('express');
const controller = require('../controllers/queries.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createQuerySchema, updateQueryStatusSchema } = require('../validators/queries.schema');

const router = Router();

router.use(authenticate);

// Clients open queries
router.post('/', authorize('CLIENT'), validate(createQuerySchema), controller.create);

// Both can view (controller filters by role)
router.get('/', authorize('VENDOR', 'CLIENT'), controller.getAll);
router.get('/:id', authorize('VENDOR', 'CLIENT'), controller.getById);

// Vendors resolve queries
router.patch('/:id/status', authorize('VENDOR'), validate(updateQueryStatusSchema), controller.updateStatus);
router.patch('/:id/resolve', authorize('VENDOR'), validate(updateQueryStatusSchema), controller.updateStatus);

module.exports = router;

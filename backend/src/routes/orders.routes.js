const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');
const lateFeeController = require('../controllers/lateFee.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { orderSchema, orderStatusUpdateSchema } = require('../validators/orders.schema');

const router = Router();

router.use(authenticate);

router.post('/', authorize('VENDOR', 'CLIENT'), validate(orderSchema), ordersController.create);
router.get('/', authorize('VENDOR', 'CLIENT'), ordersController.getAll);
router.get('/:id', authorize('VENDOR', 'CLIENT'), ordersController.getById);
router.patch('/:id/status', authorize('VENDOR'), validate(orderStatusUpdateSchema), ordersController.updateStatus);
router.post('/:id/late-fee/calculate', authorize('VENDOR'), lateFeeController.calculate);

module.exports = router;

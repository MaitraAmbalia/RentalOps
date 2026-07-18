const { Router } = require('express');
const ordersController = require('../controllers/orders.controller');
const lateFeeController = require('../controllers/lateFee.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { orderSchema, orderStatusUpdateSchema } = require('../validators/orders.schema');

const router = Router();

router.use(authenticate);

const paymentsController = require('../controllers/payments.controller');
const depositInvoicesController = require('../controllers/depositInvoices.controller');

router.post('/', authorize('VENDOR', 'CLIENT'), validate(orderSchema), ordersController.create);
router.get('/', authorize('VENDOR', 'CLIENT'), ordersController.getAll);
router.get('/:id', authorize('VENDOR', 'CLIENT'), ordersController.getById);
router.patch('/:id/status', authorize('VENDOR'), validate(orderStatusUpdateSchema), ordersController.updateStatus);
router.post('/:id/late-fee/calculate', authorize('VENDOR'), lateFeeController.calculate);
router.post('/:id/payments/razorpay-order', authorize('VENDOR', 'CLIENT'), (req, res, next) => {
  req.params.orderId = req.params.id;
  paymentsController.initiate(req, res, next);
});
router.get('/:id/deposit-invoice', authorize('VENDOR', 'CLIENT'), (req, res, next) => {
  req.params.orderId = req.params.id;
  depositInvoicesController.getByOrderId(req, res, next);
});
router.patch('/:id/deposit-invoice/settle', authorize('VENDOR'), (req, res, next) => {
  req.params.orderId = req.params.id;
  depositInvoicesController.processRefund(req, res, next);
});

module.exports = router;

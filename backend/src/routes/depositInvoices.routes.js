const { Router } = require('express');
const controller = require('../controllers/depositInvoices.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { depositRefundSchema } = require('../validators/invoices.schema');

const router = Router();

router.use(authenticate);

// Security deposits are queried by order
router.get('/order/:orderId', authorize('VENDOR', 'CLIENT'), controller.getByOrderId);
router.patch('/order/:orderId/refund', authorize('VENDOR'), validate(depositRefundSchema), controller.processRefund);

module.exports = router;

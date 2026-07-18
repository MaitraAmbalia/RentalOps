const { Router } = require('express');
const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = Router();

router.post('/:orderId/initiate', authenticate, authorize('VENDOR', 'CLIENT'), paymentsController.initiate);

// Webhook doesn't require JWT authentication, it relies on signature verification
router.post('/webhook', paymentsController.webhook);

module.exports = router;

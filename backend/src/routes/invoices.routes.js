const { Router } = require('express');
const controller = require('../controllers/invoices.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { invoiceSchema } = require('../validators/invoices.schema');

const router = Router();

router.use(authenticate);

// Invoices generally managed by VENDOR
router.post('/', authorize('VENDOR'), validate(invoiceSchema), controller.create);
router.get('/', authorize('VENDOR'), controller.getAll);
router.get('/:id', authorize('VENDOR', 'CLIENT'), controller.getById); // Client can view their invoice
router.get('/:id/pdf', authorize('VENDOR', 'CLIENT'), controller.downloadPDF); // Client/Vendor can view PDF
router.patch('/:id/post', authorize('VENDOR'), controller.postInvoice);

module.exports = router;

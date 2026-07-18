const { Router } = require('express');
const controller = require('../controllers/quotations.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { quotationSchema, quotationStatusUpdateSchema } = require('../validators/quotations.schema');

const router = Router();

router.use(authenticate);

router.post('/', authorize('VENDOR', 'CLIENT'), validate(quotationSchema), controller.create);
router.get('/', authorize('VENDOR', 'CLIENT'), controller.getAll);
router.get('/:id', authorize('VENDOR', 'CLIENT'), controller.getById);
router.get('/:id/pdf', authorize('VENDOR', 'CLIENT'), controller.downloadPDF);
router.post('/:id/send-email', authorize('VENDOR'), controller.sendEmail);
router.post('/:id/accept', authorize('CLIENT'), controller.acceptByClient);
router.patch('/:id/status', authorize('VENDOR', 'CLIENT'), validate(quotationStatusUpdateSchema), controller.updateStatus);

module.exports = router;

const router = require('express').Router();
const { generateInvoice, getInvoiceByBooking } = require('../controllers/invoiceController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', generateInvoice);
router.get('/booking/:bookingId', getInvoiceByBooking);

module.exports = router;

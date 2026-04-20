const router = require('express').Router();
const { createBooking, getBookings, updateBookingStatus, updatePaymentStatus } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id/status', updateBookingStatus);
router.put('/:id/payment-status', updatePaymentStatus);

module.exports = router;

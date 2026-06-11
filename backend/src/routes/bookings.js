const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireVerified } = require('../middleware/auth');
const { createBooking, getUserBookings, getBooking, cancelBooking } = require('../controllers/bookingController');

router.use(authenticate, requireVerified);

router.post('/', [
  body('items').isArray({ min: 1 }),
  body('items.*.ticket_category_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1, max: 10 }),
  validate,
], createBooking);

router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;

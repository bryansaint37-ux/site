const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireVerified } = require('../middleware/auth');
const {
  createStripeIntent, stripeWebhook,
  createPayPalOrder, capturePayPalOrder,
  initiateMobileMoney, verifyMobileMoneyPayment,
} = require('../controllers/paymentController');

// Stripe webhook (raw body, no auth)
router.post('/webhook', stripeWebhook);

router.use(authenticate, requireVerified);

// Stripe
router.post('/stripe/intent', [body('booking_id').isUUID(), validate], createStripeIntent);

// PayPal
router.post('/paypal/order', [body('booking_id').isUUID(), validate], createPayPalOrder);
router.post('/paypal/capture', [body('order_id').notEmpty(), body('booking_id').isUUID(), validate], capturePayPalOrder);

// Mobile Money
router.post('/mobile-money/initiate', [
  body('booking_id').isUUID(),
  body('phone_number').matches(/^\+?[\d\s-]{10,15}$/),
  body('provider').isIn(['mtn', 'airtel', 'mpesa', 'orange']),
  validate,
], initiateMobileMoney);
router.post('/mobile-money/verify', [body('transaction_id').notEmpty(), body('booking_id').isUUID(), validate], verifyMobileMoneyPayment);

module.exports = router;

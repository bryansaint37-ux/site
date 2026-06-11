const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { query, getClient } = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { sendBookingConfirmationEmail } = require('../utils/email');
const ticketService = require('../services/ticketService');

// ─── Stripe ──────────────────────────────────────────────────────────────────

const createStripeIntent = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const { rows } = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND payment_status = $3',
      [booking_id, req.user.id, 'pending']
    );
    if (!rows[0]) throw createError('Booking not found', 404);

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(rows[0].total_amount * 100),
      currency: rows[0].currency.toLowerCase(),
      metadata: { booking_id, user_id: req.user.id },
    });

    await query('UPDATE bookings SET payment_intent_id = $1 WHERE id = $2', [intent.id, booking_id]);

    res.json({ success: true, clientSecret: intent.client_secret });
  } catch (err) { next(err); }
};

const stripeWebhook = async (req, res, next) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const { booking_id } = event.data.object.metadata;
    await confirmBookingPayment(booking_id, 'stripe', event.data.object.id);
  }

  res.json({ received: true });
};

// ─── PayPal ──────────────────────────────────────────────────────────────────

const createPayPalOrder = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const { rows } = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND payment_status = $3',
      [booking_id, req.user.id, 'pending']
    );
    if (!rows[0]) throw createError('Booking not found', 404);

    const accessToken = await getPayPalAccessToken();
    const baseURL = process.env.PAYPAL_MODE === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const response = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: booking_id,
          amount: { currency_code: rows[0].currency, value: rows[0].total_amount.toFixed(2) },
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/booking/success?booking=${booking_id}`,
          cancel_url: `${process.env.FRONTEND_URL}/booking/cancel?booking=${booking_id}`,
        },
      }),
    });

    const order = await response.json();
    const approvalUrl = order.links.find(l => l.rel === 'approve').href;
    res.json({ success: true, orderId: order.id, approvalUrl });
  } catch (err) { next(err); }
};

const capturePayPalOrder = async (req, res, next) => {
  try {
    const { order_id, booking_id } = req.body;
    const accessToken = await getPayPalAccessToken();
    const baseURL = process.env.PAYPAL_MODE === 'sandbox'
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const response = await fetch(`${baseURL}/v2/checkout/orders/${order_id}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });

    const capture = await response.json();
    if (capture.status === 'COMPLETED') {
      await confirmBookingPayment(booking_id, 'paypal', order_id);
      res.json({ success: true, message: 'Payment captured successfully' });
    } else {
      throw createError('PayPal payment not completed', 400);
    }
  } catch (err) { next(err); }
};

// ─── Mobile Money Simulation ─────────────────────────────────────────────────

const initiateMobileMoney = async (req, res, next) => {
  try {
    const { booking_id, phone_number, provider } = req.body;
    const { rows } = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND payment_status = $3',
      [booking_id, req.user.id, 'pending']
    );
    if (!rows[0]) throw createError('Booking not found', 404);

    // Simulate Mobile Money (MTN, Airtel, M-Pesa style)
    const transactionId = `MM-${Date.now()}`;
    await query('UPDATE bookings SET payment_intent_id = $1 WHERE id = $2', [transactionId, booking_id]);

    // Simulate async callback after 3s in dev
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => confirmBookingPayment(booking_id, 'mobile_money', transactionId), 3000);
    }

    res.json({
      success: true,
      transactionId,
      message: `Payment request sent to ${phone_number}. Approve on your ${provider} app.`,
    });
  } catch (err) { next(err); }
};

const verifyMobileMoneyPayment = async (req, res, next) => {
  try {
    const { transaction_id, booking_id } = req.body;
    const { rows } = await query(
      'SELECT * FROM bookings WHERE id = $1 AND payment_intent_id = $2',
      [booking_id, transaction_id]
    );
    if (!rows[0]) throw createError('Transaction not found', 404);

    res.json({ success: true, status: rows[0].payment_status, booking: rows[0] });
  } catch (err) { next(err); }
};

// ─── Shared ───────────────────────────────────────────────────────────────────

const confirmBookingPayment = async (bookingId, paymentMethod, paymentIntentId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows: [booking] } = await client.query(
      `UPDATE bookings SET status = 'confirmed', payment_status = 'paid', payment_method = $1, payment_intent_id = $2
       WHERE id = $3 RETURNING *`,
      [paymentMethod, paymentIntentId, bookingId]
    );

    if (!booking) return;

    const tickets = await ticketService.generateTickets(client, booking);
    const { rows: [user] } = await client.query('SELECT * FROM users WHERE id = $1', [booking.user_id]);

    await client.query('COMMIT');

    const pdfBuffer = await ticketService.generatePDFBundle(tickets, booking);
    await sendBookingConfirmationEmail(user, booking, pdfBuffer).catch(() => null);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getPayPalAccessToken = async () => {
  const baseURL = process.env.PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
};

module.exports = { createStripeIntent, stripeWebhook, createPayPalOrder, capturePayPalOrder, initiateMobileMoney, verifyMobileMoneyPayment };

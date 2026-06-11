const { getClient } = require('../config/database');
const { generateBookingReference, generateTicketNumber } = require('../utils/helpers');
const { createError } = require('../middleware/errorHandler');

const createBooking = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { items } = req.body; // [{ ticket_category_id, quantity }]
    const userId = req.user.id;

    if (!items?.length) throw createError('Booking items required', 400);

    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT * FROM ticket_categories WHERE id = $1 FOR UPDATE',
        [item.ticket_category_id]
      );
      const category = rows[0];
      if (!category) throw createError(`Ticket category not found: ${item.ticket_category_id}`, 404);
      if (category.available_seats < item.quantity) throw createError(`Not enough seats for ${category.name}`, 400);
      if (item.quantity < 1 || item.quantity > 10) throw createError('Quantity must be between 1 and 10', 400);

      const subtotal = parseFloat(category.price) * item.quantity;
      totalAmount += subtotal;
      resolvedItems.push({ ...item, category, subtotal });
    }

    const bookingRef = generateBookingReference();
    const { rows: [booking] } = await client.query(
      `INSERT INTO bookings (user_id, booking_reference, total_amount, status, payment_status)
       VALUES ($1,$2,$3,'pending','pending') RETURNING *`,
      [userId, bookingRef, totalAmount]
    );

    const bookingItemIds = [];
    for (const item of resolvedItems) {
      const { rows: [bookingItem] } = await client.query(
        `INSERT INTO booking_items (booking_id, ticket_category_id, quantity, unit_price, subtotal)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [booking.id, item.ticket_category_id, item.quantity, item.category.price, item.subtotal]
      );
      bookingItemIds.push({ bookingItemId: bookingItem.id, quantity: item.quantity });

      await client.query(
        'UPDATE ticket_categories SET available_seats = available_seats - $1 WHERE id = $2',
        [item.quantity, item.ticket_category_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: { ...booking, items: bookingItemIds } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const { rows } = await require('../config/database').query(`
      SELECT
        b.id, b.booking_reference, b.status, b.total_amount, b.currency,
        b.payment_method, b.payment_status, b.created_at,
        json_agg(json_build_object(
          'id', bi.id, 'quantity', bi.quantity, 'unit_price', bi.unit_price, 'subtotal', bi.subtotal,
          'category', json_build_object('id', tc.id, 'name', tc.name, 'section', tc.section),
          'match', json_build_object(
            'id', m.id, 'match_date', m.match_date, 'stage', m.stage,
            'home_team', ht.name, 'away_team', at.name, 'stadium', s.name
          )
        )) AS items
      FROM bookings b
      JOIN booking_items bi ON b.id = bi.booking_id
      JOIN ticket_categories tc ON bi.ticket_category_id = tc.id
      JOIN matches m ON tc.match_id = m.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      WHERE b.user_id = $1
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const getBooking = async (req, res, next) => {
  try {
    const { rows } = await require('../config/database').query(`
      SELECT b.*, u.email, u.first_name, u.last_name FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1 AND (b.user_id = $2 OR $3 IN ('admin','super_admin'))
    `, [req.params.id, req.user.id, req.user.role]);

    if (!rows[0]) throw createError('Booking not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT b.*, bi.ticket_category_id, bi.quantity FROM bookings b
       JOIN booking_items bi ON b.id = bi.booking_id
       WHERE b.id = $1 AND b.user_id = $2 AND b.status IN ('pending','confirmed') FOR UPDATE`,
      [req.params.id, req.user.id]
    );

    if (!rows[0]) throw createError('Booking not found or cannot be cancelled', 400);

    await client.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', req.params.id]);

    for (const row of rows) {
      await client.query(
        'UPDATE ticket_categories SET available_seats = available_seats + $1 WHERE id = $2',
        [row.quantity, row.ticket_category_id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { createBooking, getUserBookings, getBooking, cancelBooking };

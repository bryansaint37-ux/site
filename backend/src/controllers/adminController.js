const { query } = require('../config/database');
const { createError } = require('../middleware/errorHandler');

// ─── Users ────────────────────────────────────────────────────────────────────

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    if (search) { params.push(`%${search}%`); conditions.push(`(email ILIKE $${params.length} OR first_name ILIKE $${params.length} OR last_name ILIKE $${params.length})`); }
    if (role) { params.push(role); conditions.push(`role = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query(`SELECT COUNT(*) FROM users ${where}`, params);
    params.push(parseInt(limit), offset);

    const { rows } = await query(
      `SELECT id, email, first_name, last_name, role, is_verified, is_active, last_login, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ success: true, data: rows, pagination: { total: parseInt(countRes.rows[0].count), page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { is_active, role } = req.body;
    const { rows } = await query(
      'UPDATE users SET is_active = COALESCE($1, is_active), role = COALESCE($2, role) WHERE id = $3 RETURNING id, email, role, is_active',
      [is_active, role, req.params.id]
    );
    if (!rows[0]) throw createError('User not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ─── Matches ──────────────────────────────────────────────────────────────────

const createMatch = async (req, res, next) => {
  try {
    const { home_team_id, away_team_id, stadium_id, match_date, stage, group_name, match_number } = req.body;
    const { rows } = await query(
      `INSERT INTO matches (home_team_id, away_team_id, stadium_id, match_date, stage, group_name, match_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [home_team_id, away_team_id, stadium_id, match_date, stage, group_name, match_number]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateMatch = async (req, res, next) => {
  try {
    const { status, match_date } = req.body;
    const { rows } = await query(
      'UPDATE matches SET status = COALESCE($1, status), match_date = COALESCE($2, match_date) WHERE id = $3 RETURNING *',
      [status, match_date, req.params.id]
    );
    if (!rows[0]) throw createError('Match not found', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payment_status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];

    if (status) { params.push(status); conditions.push(`b.status = $${params.length}`); }
    if (payment_status) { params.push(payment_status); conditions.push(`b.payment_status = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query(`SELECT COUNT(*) FROM bookings b ${where}`, params);
    params.push(parseInt(limit), offset);

    const { rows } = await query(`
      SELECT b.*, u.email, u.first_name, u.last_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json({ success: true, data: rows, pagination: { total: parseInt(countRes.rows[0].count) } });
  } catch (err) { next(err); }
};

// ─── Analytics ────────────────────────────────────────────────────────────────

const getAnalytics = async (req, res, next) => {
  try {
    const [revenue, bookings, users, topMatches] = await Promise.all([
      query(`SELECT COALESCE(SUM(total_amount), 0) as total_revenue, COUNT(*) as total_bookings FROM bookings WHERE payment_status = 'paid'`),
      query(`SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count, SUM(total_amount) as revenue
             FROM bookings WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1`),
      query('SELECT COUNT(*) as total_users, COUNT(*) FILTER (WHERE is_verified) as verified FROM users'),
      query(`
        SELECT m.id, ht.name as home_team, at.name as away_team, s.name as stadium,
               COUNT(b.id) as booking_count, COALESCE(SUM(b.total_amount), 0) as revenue
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        JOIN stadiums s ON m.stadium_id = s.id
        LEFT JOIN ticket_categories tc ON m.id = tc.match_id
        LEFT JOIN booking_items bi ON tc.id = bi.ticket_category_id
        LEFT JOIN bookings b ON bi.booking_id = b.id AND b.payment_status = 'paid'
        GROUP BY m.id, ht.name, at.name, s.name
        ORDER BY revenue DESC LIMIT 5
      `),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(revenue.rows[0].total_revenue),
        totalBookings: parseInt(revenue.rows[0].total_bookings),
        totalUsers: parseInt(users.rows[0].total_users),
        verifiedUsers: parseInt(users.rows[0].verified),
        dailyStats: bookings.rows,
        topMatches: topMatches.rows,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getUsers, updateUser, createMatch, updateMatch, getAllBookings, getAnalytics };

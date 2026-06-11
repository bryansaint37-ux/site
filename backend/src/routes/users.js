const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { createError } = require('../middleware/errorHandler');

router.use(authenticate);

router.get('/me', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, email, first_name, last_name, phone, role, is_verified, last_login, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

router.patch('/me', [
  body('first_name').optional().trim().isLength({ min: 2, max: 50 }),
  body('last_name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^\+?[\d\s-]{10,15}$/),
  validate,
], async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const { rows } = await query(
      `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone)
       WHERE id = $4
       RETURNING id, email, first_name, last_name, phone, role`,
      [first_name, last_name, phone, req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

router.patch('/me/password', [
  body('current_password').notEmpty(),
  body('new_password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  validate,
], async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!(await bcrypt.compare(current_password, rows[0].password_hash))) {
      throw createError('Current password is incorrect', 400);
    }
    const newHash = await bcrypt.hash(new_password, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

module.exports = router;

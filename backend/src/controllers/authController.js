const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { generateSecureToken, hashToken } = require('../utils/helpers');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { createError } = require('../middleware/errorHandler');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows[0]) throw createError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, verification_token, verification_expires)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, email, first_name, last_name, role`,
      [email.toLowerCase(), passwordHash, first_name, last_name, phone, verificationToken, verificationExpires]
    );

    await sendVerificationEmail(rows[0], verificationToken).catch(() => null);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: rows[0],
    });
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rows } = await query(
      `UPDATE users SET is_verified = true, verification_token = NULL, verification_expires = NULL
       WHERE verification_token = $1 AND verification_expires > NOW()
       RETURNING id, email, first_name`,
      [token]
    );
    if (!rows[0]) throw createError('Invalid or expired verification token', 400);
    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw createError('Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
      [user.id, tokenHash, expiresAt]
    );
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, is_verified: user.is_verified },
    });
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw createError('Refresh token required', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const tokenHash = hashToken(token);

    const { rows } = await query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2 AND expires_at > NOW()',
      [tokenHash, decoded.userId]
    );
    if (!rows[0]) throw createError('Invalid refresh token', 401);

    await query('DELETE FROM refresh_tokens WHERE id = $1', [rows[0].id]);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)', [decoded.userId, newHash, expiresAt]);

    res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const tokenHash = hashToken(token);
      await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { rows } = await query('SELECT id, email, first_name FROM users WHERE email = $1', [email.toLowerCase()]);

    // Always return success to prevent email enumeration
    if (rows[0]) {
      const resetToken = generateSecureToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await query('UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3', [resetToken, resetExpires, rows[0].id]);
      await sendPasswordResetEmail(rows[0], resetToken).catch(() => null);
    }

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
       WHERE reset_token = $2 AND reset_token_expires > NOW()
       RETURNING id`,
      [passwordHash, token]
    );
    if (!rows[0]) throw createError('Invalid or expired reset token', 400);

    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [rows[0].id]);
    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) { next(err); }
};

module.exports = { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword };

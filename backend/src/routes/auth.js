const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword } = require('../controllers/authController');

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .withMessage('Password must include uppercase, lowercase, number, and special character');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().isLength({ min: 2, max: 50 }),
  body('last_name').trim().isLength({ min: 2, max: 50 }),
  passwordRules,
  validate,
], register);

router.get('/verify-email/:token', verifyEmail);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
], login);

router.post('/refresh-token', [body('refreshToken').notEmpty(), validate], refreshToken);
router.post('/logout', logout);

router.post('/forgot-password', [body('email').isEmail().normalizeEmail(), validate], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty(),
  passwordRules,
  validate,
], resetPassword);

module.exports = router;

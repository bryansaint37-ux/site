const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getUsers, updateUser, createMatch, updateMatch, getAllBookings, getAnalytics } = require('../controllers/adminController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.use(authenticate, requireRole('admin', 'super_admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.patch('/users/:id', [
  body('is_active').optional().isBoolean(),
  body('role').optional().isIn(['user', 'admin']),
  validate,
], updateUser);

// Matches
router.post('/matches', [
  body('home_team_id').isUUID(),
  body('away_team_id').isUUID(),
  body('stadium_id').isUUID(),
  body('match_date').isISO8601(),
  body('stage').isIn(['group', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final']),
  validate,
], createMatch);
router.patch('/matches/:id', [
  body('status').optional().isIn(['scheduled', 'live', 'completed', 'cancelled']),
  body('match_date').optional().isISO8601(),
  validate,
], updateMatch);

// Bookings
router.get('/bookings', getAllBookings);

module.exports = router;

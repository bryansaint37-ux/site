const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getTicketsByBooking, downloadTicketPDF } = require('../services/ticketService');

router.use(authenticate);

router.get('/booking/:bookingId', getTicketsByBooking);
router.get('/:ticketId/download', downloadTicketPDF);

module.exports = router;

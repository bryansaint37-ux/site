const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { generateTicketNumber } = require('../utils/helpers');

const generateTickets = async (client, booking) => {
  const { rows: items } = await client.query(
    `SELECT bi.*, tc.name as category_name, tc.section,
            m.match_date, m.stage, m.group_name,
            ht.name as home_team, at.name as away_team,
            s.name as stadium_name, s.city
     FROM booking_items bi
     JOIN ticket_categories tc ON bi.ticket_category_id = tc.id
     JOIN matches m ON tc.match_id = m.id
     JOIN teams ht ON m.home_team_id = ht.id
     JOIN teams at ON m.away_team_id = at.id
     JOIN stadiums s ON m.stadium_id = s.id
     WHERE bi.booking_id = $1`,
    [booking.id]
  );

  const tickets = [];
  let ticketIndex = 1;

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = generateTicketNumber(booking.booking_reference, ticketIndex++);
      const ticketData = JSON.stringify({ ticketNumber, bookingRef: booking.booking_reference, userId: booking.user_id });
      const qrCode = await QRCode.toDataURL(ticketData, { width: 200, margin: 1 });

      const { rows: [ticket] } = await client.query(
        `INSERT INTO tickets (booking_item_id, ticket_number, qr_code, seat_number)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [item.id, ticketNumber, qrCode, `${item.section}-${String(ticketIndex).padStart(3, '0')}`]
      );

      tickets.push({ ...ticket, ...item });
    }
  }

  return tickets;
};

const generatePDFBundle = (tickets, booking) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    tickets.forEach((ticket, idx) => {
      if (idx > 0) doc.addPage();

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill('#1a56db');
      doc.fillColor('white').fontSize(24).font('Helvetica-Bold')
        .text('⚽ WORLD CUP TICKETS', 40, 20);
      doc.fontSize(10).font('Helvetica').text('Official Match Ticket', 40, 52);

      // Match info
      doc.fillColor('#111827').fontSize(18).font('Helvetica-Bold')
        .text(`${ticket.home_team} vs ${ticket.away_team}`, 40, 100);
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
        .text(`📅 ${new Date(ticket.match_date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, 40, 128)
        .text(`🏟️  ${ticket.stadium_name}, ${ticket.city}`, 40, 148)
        .text(`🏆 Stage: ${ticket.stage.replace(/_/g, ' ').toUpperCase()}`, 40, 168);

      // Divider
      doc.moveTo(40, 195).lineTo(doc.page.width - 40, 195).stroke('#e5e7eb');

      // Ticket details
      doc.fillColor('#111827').fontSize(12).font('Helvetica-Bold').text('TICKET DETAILS', 40, 210);
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
        .text(`Ticket No: ${ticket.ticket_number}`, 40, 230)
        .text(`Category: ${ticket.category_name}`, 40, 248)
        .text(`Section: ${ticket.section}`, 40, 266)
        .text(`Seat: ${ticket.seat_number}`, 40, 284)
        .text(`Booking Ref: ${booking.booking_reference}`, 40, 302);

      // QR Code
      if (ticket.qr_code) {
        const qrBuffer = Buffer.from(ticket.qr_code.split(',')[1], 'base64');
        doc.image(qrBuffer, doc.page.width - 180, 200, { width: 140, height: 140 });
        doc.fontSize(8).fillColor('#6b7280').text('Scan at entrance', doc.page.width - 170, 348);
      }

      // Footer
      doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#f9fafb');
      doc.fillColor('#6b7280').fontSize(8)
        .text('This ticket is valid only for the specified match. Non-transferable. Keep this ticket safe.', 40, doc.page.height - 35);
    });

    doc.end();
  });
};

const getTicketsByBooking = async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    const { rows } = await query(`
      SELECT t.*, bi.quantity, tc.name as category_name, tc.section,
             m.match_date, ht.name as home_team, at.name as away_team, s.name as stadium
      FROM tickets t
      JOIN booking_items bi ON t.booking_item_id = bi.id
      JOIN bookings b ON bi.booking_id = b.id
      JOIN ticket_categories tc ON bi.ticket_category_id = tc.id
      JOIN matches m ON tc.match_id = m.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [req.params.bookingId, req.user.id]);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const downloadTicketPDF = async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    const { rows } = await query(`
      SELECT t.*, bi.quantity, tc.name as category_name, tc.section,
             m.match_date, m.stage, ht.name as home_team, at.name as away_team,
             s.name as stadium_name, s.city, b.booking_reference, b.user_id
      FROM tickets t
      JOIN booking_items bi ON t.booking_item_id = bi.id
      JOIN bookings b ON bi.booking_id = b.id
      JOIN ticket_categories tc ON bi.ticket_category_id = tc.id
      JOIN matches m ON tc.match_id = m.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      WHERE t.id = $1 AND b.user_id = $2
    `, [req.params.ticketId, req.user.id]);

    if (!rows[0]) return next(require('../middleware/errorHandler').createError('Ticket not found', 404));

    const ticket = rows[0];
    const pdfBuffer = await generatePDFBundle([ticket], { booking_reference: ticket.booking_reference });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${ticket.ticket_number}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

module.exports = { generateTickets, generatePDFBundle, getTicketsByBooking, downloadTicketPDF };

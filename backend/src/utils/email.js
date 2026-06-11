const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error('Email send error:', err);
    throw err;
  }
};

const sendVerificationEmail = (user, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify your World Cup Tickets account',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a56db">World Cup Tickets</h1>
        <h2>Verify Your Email</h2>
        <p>Hi ${user.first_name}, please verify your email to activate your account.</p>
        <a href="${url}" style="background:#1a56db;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">Verify Email</a>
        <p style="color:#666;font-size:14px">Link expires in 24 hours. If you didn't register, ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = (user, token) => {
  const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your World Cup Tickets password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a56db">World Cup Tickets</h1>
        <h2>Password Reset</h2>
        <p>Hi ${user.first_name}, click below to reset your password.</p>
        <a href="${url}" style="background:#e02424;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">Reset Password</a>
        <p style="color:#666;font-size:14px">Link expires in 1 hour. If you didn't request this, ignore it.</p>
      </div>
    `,
  });
};

const sendBookingConfirmationEmail = (user, booking, pdfBuffer) => {
  return sendEmail({
    to: user.email,
    subject: `Booking Confirmed - ${booking.booking_reference}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#1a56db">World Cup Tickets</h1>
        <h2 style="color:#057a55">✅ Booking Confirmed!</h2>
        <p>Hi ${user.first_name}, your booking is confirmed.</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0">
          <p><strong>Reference:</strong> ${booking.booking_reference}</p>
          <p><strong>Amount:</strong> $${booking.total_amount}</p>
          <p><strong>Status:</strong> Confirmed</p>
        </div>
        <p>Your tickets are attached as PDF. Present them at the stadium entrance.</p>
        <p style="color:#666;font-size:14px">Thank you for booking with World Cup Tickets!</p>
      </div>
    `,
    attachments: pdfBuffer ? [{
      filename: `tickets-${booking.booking_reference}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : [],
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail, sendBookingConfirmationEmail };

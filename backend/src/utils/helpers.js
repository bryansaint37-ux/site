const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const generateBookingReference = () => {
  const prefix = 'WC';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}${timestamp}${random}`;
};

const generateTicketNumber = (bookingRef, index) => {
  return `${bookingRef}-T${String(index).padStart(3, '0')}`;
};

const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = { generateBookingReference, generateTicketNumber, generateSecureToken, hashToken };

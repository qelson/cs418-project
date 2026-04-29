const nodemailer = require('nodemailer');

const EMAIL_CONFIGURED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const EMAIL_SERVICE    = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();

const buildTransportConfig = () => {
  const auth = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS };
  if (EMAIL_SERVICE === 'outlook') {
    return { host: 'smtp.office365.com', port: 587, secure: false, requireTLS: true, auth };
  }
  return { service: 'gmail', auth };
};

const transporter = EMAIL_CONFIGURED
  ? nodemailer.createTransport(buildTransportConfig())
  : null;

const sendEmail = async (to, subject, text, html) => {
  if (!EMAIL_CONFIGURED) {
    console.log(`[DEV] Email to ${to} | ${subject} | ${text}`);
    return;
  }
  try {
    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
    console.log('[Email] SENT to', to, '| messageId:', info.messageId);
  } catch (err) {
    console.error('[Email] SEND FAILED:', err.message);
    console.log(`[DEV FALLBACK] Email to ${to} | ${subject} | ${text}`);
  }
};

module.exports = { sendEmail };

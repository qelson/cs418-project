const express      = require('express');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const crypto       = require('crypto');
const nodemailer   = require('nodemailer');
const User         = require('../models/User');
 
const router = express.Router();
 
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
 
// ── Email transport ───────────────────────────────────────────────────────────
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
 
if (EMAIL_CONFIGURED) {
  console.log(`[Email] SMTP configured → service=${EMAIL_SERVICE}, user=${process.env.EMAIL_USER}`);
} else {
  console.log('[Email] No credentials — falling back to console logging');
}
 
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
    
  }
};
 
const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  await sendEmail(
    email,
    'Verify your email',
    `Click to verify your account: ${link}`,
    `<p>Click to verify your account:</p><a href="${link}">${link}</a>`
  );
};
 
const sendOtpEmail = async (email, otp) => {
  await sendEmail(
    email,
    'Your login OTP',
    `Your one-time code is: ${otp}  (expires in 10 minutes)`,
    `<p>Your one-time login code is: <strong>${otp}</strong> (expires in 10 minutes)</p>`
  );
};
 
// ── Routes ────────────────────────────────────────────────────────────────────
 
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
 
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
 
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
 
    const hashed            = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
 
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      verificationToken,
    });
 
    await sendVerificationEmail(email, verificationToken);
 
    return res.status(201).json({
      message: 'Registration successful. Check your email to verify your account.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
// GET /api/auth/verify-email?token=<token>
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
 
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }
 
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
 
    user.verified          = true;
    user.verificationToken = null;
    await user.save();
 
    return res.json({ message: 'Email verified successfully. You may now log in.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
// POST /api/auth/login — step 1: validate credentials, send OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
 
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
 
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
 
    if (!user.verified) {
      return res.status(403).json({ message: 'Account not yet verified. Check your email.' });
    }
 
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otpCode   = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
 
    await sendOtpEmail(email, otp);
 
    return res.json({ message: 'OTP sent to your email. Please verify to complete login.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
// POST /api/auth/verify-otp — step 2: verify OTP, return JWT
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
 
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }
 
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otpCode) {
      return res.status(400).json({ message: 'No pending OTP for this account' });
    }
 
    if (user.otpExpiry < new Date()) {
      user.otpCode   = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please log in again.' });
    }
 
    if (user.otpCode !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }
 
    user.otpCode   = null;
    user.otpExpiry = null;
    await user.save();
 
    return res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  console.log('[forgot-password] route entered');
  const { email } = req.body;
  console.log('[forgot-password] email received:', email);
  if (!email) return res.status(400).json({ message: 'Email is required' });
 
  try {
    const user = await User.findOne({ email });
    console.log('[forgot-password] user found:', !!user);
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });
 
    const token = crypto.randomBytes(32).toString('hex');
    console.log('[forgot-password] reset token generated');
    user.resetPasswordToken  = token;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
 
    const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log('[forgot-password] calling sendEmail to:', email);
    await sendEmail(
      email,
      'Password reset request',
      `Reset your password: ${link}`,
      `<p>Reset your password:</p><a href="${link}">${link}</a>`
    );
    console.log('[forgot-password] sendEmail completed');
 
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[forgot-password] ERROR message:', err.message);
    console.error('[forgot-password] ERROR full:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
 
  try {
    const user = await User.findOne({
      resetPasswordToken:  token,
      resetPasswordExpiry: { $gt: new Date() },
    });
 
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
 
    user.password            = await bcrypt.hash(password, 12);
    user.resetPasswordToken  = null;
    user.resetPasswordExpiry = null;
    await user.save();
 
    return res.json({ message: 'Password reset successful. You may now log in.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
// POST /api/auth/dev-verify — DEV ONLY: manually verify a user by email
router.post('/dev-verify', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
 
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
 
    user.verified          = true;
    user.verificationToken = null;
    await user.save();
 
    return res.json({ message: `User ${email} verified successfully` });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});
 
module.exports = router;
 
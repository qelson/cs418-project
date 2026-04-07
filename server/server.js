require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/user');
const advisingRoutes = require('./routes/advising');
const courses        = require('./data/courses');
const User           = require('./models/User');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/advising', advisingRoutes);
app.get('/api/courses', (req, res) => res.json(courses));

// ── Serve React build in production ──────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ── Admin seed ────────────────────────────────────────────────────────────────
// Creates a verified admin account on first boot if it doesn't exist yet.
const seedAdmin = async () => {
  const email    = process.env.ADMIN_EMAIL    || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const existing = await User.findOne({ email });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    firstName: 'Admin',
    lastName:  'User',
    email,
    password:  hashed,
    role:      'admin',
    verified:  true,
  });

  console.log(`Admin seeded → ${email}`);
};

// ── Database + start ──────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

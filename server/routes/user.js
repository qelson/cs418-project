const express  = require('express');
const bcrypt   = require('bcrypt');
const { protect } = require('../middleware/authMiddleware');
const User     = require('../models/User');

const router = express.Router();

// GET /api/user/me
router.get('/me', protect, (req, res) => {
  const { _id, firstName, lastName, email, role, verified, createdAt } = req.user;
  return res.json({ id: _id, firstName, lastName, email, role, verified, createdAt });
});

// GET /api/user/profile
router.get('/profile', protect, (req, res) => {
  const { _id, firstName, lastName, email, role, verified } = req.user;
  return res.json({
    id: _id,
    firstName,
    lastName,
    email,
    verified,
    isAdmin: role === 'admin',
  });
});

// PUT /api/user/profile
router.put('/profile', protect, async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName && !lastName) {
    return res.status(400).json({ message: 'Provide at least one field to update' });
  }

  if (firstName !== undefined && !firstName.trim()) {
    return res.status(400).json({ message: 'First name cannot be blank' });
  }
  if (lastName !== undefined && !lastName.trim()) {
    return res.status(400).json({ message: 'Last name cannot be blank' });
  }

  try {
    const update = {};
    if (firstName) update.firstName = firstName.trim();
    if (lastName)  update.lastName  = lastName.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );

    return res.json({
      id: user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      verified:  user.verified,
      isAdmin:   user.role === 'admin',
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/user/change-password
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  try {
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

const express        = require('express');
const router         = express.Router();
const AdvisingRecord = require('../models/AdvisingRecord');
const { protect }    = require('../middleware/authMiddleware');
const { sendEmail }  = require('../utils/sendEmail');

// All routes require authentication
router.use(protect);

// Admin-only guard
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ── Admin routes (must be defined before /:id to avoid path conflicts) ────────

// GET /api/advising/admin/all — all records for every student
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const records = await AdvisingRecord
      .find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/advising/admin/:id — single record (admin, any student)
router.get('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const record = await AdvisingRecord
      .findById(req.params.id)
      .populate('user', 'firstName lastName email');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/advising/admin/:id/review — approve or reject a record
router.put('/admin/:id/review', requireAdmin, async (req, res) => {
  const { status, adminMessage } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Approved or Rejected' });
  }
  if (!adminMessage?.trim()) {
    return res.status(400).json({ message: 'Feedback message is required' });
  }

  try {
    const record = await AdvisingRecord
      .findById(req.params.id)
      .populate('user', 'firstName lastName email');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    record.status       = status;
    record.adminMessage = adminMessage.trim();
    await record.save();

    // Email notification — non-blocking
    if (record.user?.email) {
      sendEmail(
        record.user.email,
        `Advising Record ${status} — ${record.term}`,
        `Your advising record for ${record.term} has been ${status}.\n\nFeedback: ${adminMessage.trim()}`,
        `<p>Your advising record for <strong>${record.term}</strong> has been <strong>${status}</strong>.</p>
         <p><strong>Feedback:</strong> ${adminMessage.trim()}</p>`
      ).catch(err => console.error('[Email] Review notification failed:', err.message));
    }

    res.json({ message: `Record ${status} successfully`, record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── Student routes ────────────────────────────────────────────────────────────

// GET /api/advising — all records for logged-in user
router.get('/', async (req, res) => {
  try {
    const records = await AdvisingRecord.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/advising/:id — single record (must belong to user)
router.get('/:id', async (req, res) => {
  try {
    const record = await AdvisingRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/advising — create new record (always starts as Pending)
router.post('/', async (req, res) => {
  try {
    const { term, lastTerm, lastGPA, currentTerm, courses: coursePlan } = req.body;

    const record = await AdvisingRecord.create({
      user: req.user._id,
      term,
      lastTerm,
      lastGPA,
      currentTerm,
      courses: coursePlan || [],
      status: 'Pending',
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/advising/:id — update only if Pending
router.put('/:id', async (req, res) => {
  try {
    const record = await AdvisingRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (record.status !== 'Pending') {
      return res.status(403).json({ message: 'Cannot edit a record that has been approved or rejected.' });
    }

    const { term, lastTerm, lastGPA, currentTerm, courses: coursePlan } = req.body;

    record.term        = term        ?? record.term;
    record.lastTerm    = lastTerm    ?? record.lastTerm;
    record.lastGPA     = lastGPA     ?? record.lastGPA;
    record.currentTerm = currentTerm ?? record.currentTerm;
    record.courses     = coursePlan  ?? record.courses;

    await record.save();
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/advising/:id — delete only if Pending
router.delete('/:id', async (req, res) => {
  try {
    const record = await AdvisingRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (record.status !== 'Pending') {
      return res.status(403).json({ message: 'Cannot delete a record that has been approved or rejected.' });
    }

    await record.deleteOne();
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

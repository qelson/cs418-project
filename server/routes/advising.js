const express        = require('express');
const router         = express.Router();
const AdvisingRecord = require('../models/AdvisingRecord');
const { protect }    = require('../middleware/authMiddleware');

// All routes below require authentication
router.use(protect);

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

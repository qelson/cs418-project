const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  level:      { type: String },
  courseName: { type: String },
}, { _id: false });

const advisingRecordSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:        { type: Date, default: Date.now },
  term:        { type: String, required: true },
  lastTerm:    { type: String },
  lastGPA:     { type: Number },
  currentTerm: { type: String },
  status:      { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  courses:     [courseSchema],
}, { timestamps: true });

module.exports = mongoose.model('AdvisingRecord', advisingRecordSchema);

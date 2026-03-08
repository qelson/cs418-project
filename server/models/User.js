const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ['user', 'admin'], default: 'user' },
    verified:           { type: Boolean, default: false },
    verificationToken:  { type: String, default: null },
    otpCode:             { type: String, default: null },
    otpExpiry:           { type: Date,   default: null },
    resetPasswordToken:  { type: String, default: null },
    resetPasswordExpiry: { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

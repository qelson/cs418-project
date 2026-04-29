function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/.test(password))
    return 'Password must contain at least one special character (!@#$%^&* etc.)';
  return null;
}

module.exports = { validatePassword };

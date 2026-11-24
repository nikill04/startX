const mongoose = require('mongoose');

// A startup's login account. "startup" holds the id of its Startup (KYC) document.
const userSchema = new mongoose.Schema({
  username: String,
  password: String, // stored as a bcrypt hash, never as plain text
  email: String,
  startup: String,
}, { timestamps: true });

module.exports = mongoose.model('user', userSchema);

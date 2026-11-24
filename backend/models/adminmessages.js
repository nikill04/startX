const mongoose = require('mongoose');

// The chat history between one startup and the admin
const messageSchema = new mongoose.Schema({
  startup_id: String,
  messages: [{
    message: String,
    sender: String, // "User" (the startup) or "admin"
    created_at: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.model('admin_messages', messageSchema);

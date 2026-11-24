// Entry point of the backend. Run it with:  npm start   (or: node server.js)
require('dotenv').config(); // loads variables from the .env file into process.env

const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const Message = require('./models/adminmessages');
const Startup = require('./models/startupmodel');

// ----- Settings (taken from .env, with sensible defaults for local development) -----
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startX';

// ----- Database -----
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection failed:', error.message));

// ----- Express app -----
const app = express();
app.use(cors()); // allow the frontend (on a different URL) to call this API
app.use(express.json({ limit: '5mb' }));

// Old profile pictures were saved as files in /uploads. New ones are stored in the database.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----- Routes -----
app.use('/auth', require('./routers/user/auth'));      // startup register / login / KYC
app.use('/user', require('./routers/user/home'));      // startup dashboard data
app.use('/submit', require('./routers/user/forms'));   // EIR, grant and monthly report forms
app.use('/admin', require('./routers/admin/auth'));    // everything the admin does
app.use('/review', require('./routers/reviewer/route')); // everything a reviewer does

// Health check: open the backend URL in a browser to see if it is running
app.get('/', (req, res) => {
  res.send('StartX backend is running');
});

// ----- Live chat (Socket.IO) -----
// Every startup has its own "room" (named after the startup id).
// The startup and the admin both join that room, so they see each other's messages.
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Adds one message to a startup's chat history in the database
async function saveMessage(startupId, message, sender) {
  await Message.findOneAndUpdate(
    { startup_id: startupId },
    { $push: { messages: { message, sender, created_at: new Date() } } },
    { upsert: true } // create the chat document if it does not exist yet
  );
}

io.on('connection', (socket) => {
  socket.on('joinRoom', (startupId) => {
    socket.join(startupId);
  });

  // A message between one startup and the admin
  socket.on('sendMessage', async ({ roomId, messageData }) => {
    const message = { ...messageData, roomId, created_at: new Date() };
    io.to(roomId).emit('receiveMessage', message);
    try {
      await saveMessage(roomId, messageData.message, messageData.sender);
    } catch (error) {
      console.error('Could not save message:', error.message);
    }
  });

  // The admin sends the same message to every startup
  socket.on('BroadcastMessage', async ({ messageData }) => {
    try {
      const startups = await Startup.find({}, '_id');
      for (const startup of startups) {
        const roomId = startup._id.toString();
        io.to(roomId).emit('receiveMessage', { ...messageData, roomId, created_at: new Date() });
        await saveMessage(roomId, messageData.message, messageData.sender);
      }
    } catch (error) {
      console.error('Could not broadcast message:', error.message);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

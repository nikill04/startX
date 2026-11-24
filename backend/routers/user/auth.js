// Routes for startups: register, KYC (company details), login, Google login
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const axios = require('axios');
const User = require('../../models/usermodel');
const Startup = require('../../models/startupmodel');
const { sendMail } = require('../../utils/mailer');

const router = express.Router();

// Keep the uploaded picture in memory (max 10 MB) so we can save it in the database.
// (A MongoDB document can hold at most 16 MB, and a 10 MB picture becomes about 13.4 MB of text.)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /auth/register  -> create a login account
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, email });

    sendMail(email, 'Welcome to StartX', '<h1>Thanks for registering your startup on StartX</h1>');
    res.status(200).json({ message: 'Registration successful!', userId: newUser._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// POST /auth/kyc  -> save company details and link them to the user
router.post('/kyc', (req, res, next) => {
  // Run the upload first so we can show a friendly message if the picture is too big
  upload.single('profile_pic')(req, res, (error) => {
    if (error) return res.status(400).json({ message: 'Profile picture must be smaller than 10 MB' });
    next();
  });
}, async (req, res) => {
  const {
    company_name, address, contact_person_name, contact_person_email,
    contact_person_phone, incorporation_date, industry, website, user,
  } = req.body;

  // Turn the uploaded picture into text that can be shown directly in an <img src="...">
  const profilePicture = req.file
    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    : '';

  try {
    const startup = await Startup.create({
      kyc: {
        company_name,
        address,
        contact_person: { name: contact_person_name, email: contact_person_email, phone: contact_person_phone },
        company_details: { incorporation_date, industry, website },
        profile_picture: profilePicture,
      },
      progress: [],
      reports: [],
      messages: [],
      grants: [],
    });

    await User.findByIdAndUpdate(user, { startup: startup._id });
    res.status(200).json({ message: 'KYC details submitted successfully', startup: startup._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to submit KYC details' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'User not found' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', userId: user._id, startup: user.startup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to log in' });
  }
});

// GET /auth/google?access_token=...  -> log in (or sign up) with a Google account
router.get('/google', async (req, res) => {
  try {
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: { alt: 'json', access_token: req.query.access_token },
    });
    const { email, name } = googleResponse.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username: name, email });
    }

    // "startup" is empty if this user has not filled the company details (KYC) yet
    res.status(200).json({ userId: user._id, startup: user.startup });
  } catch (error) {
    console.error('Google login failed:', error.message);
    res.status(500).json({ message: 'Google login failed' });
  }
});

module.exports = router;

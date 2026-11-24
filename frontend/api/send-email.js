// Vercel serverless function: sends one email through Gmail (nodemailer).
//
// Why this exists: Render's free plan blocks email (SMTP) ports, so the backend
// can't talk to Gmail directly. Vercel allows it, so the backend sends
// { to, subject, html } here and this function sends the email.
// Vercel serves it at https://<your-site>.vercel.app/api/send-email
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST' });
  }

  // Only our backend knows this secret, so strangers can't send emails from our Gmail
  const secret = process.env.EMAIL_RELAY_SECRET;
  if (!secret || req.headers['x-email-secret'] !== secret) {
    return res.status(401).json({ message: 'Not allowed' });
  }

  const { to, subject, html } = req.body || {};
  if (!to || !subject) {
    return res.status(400).json({ message: 'to and subject are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    res.json({ message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

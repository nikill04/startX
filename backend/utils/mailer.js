// One place to send emails from. Every route uses sendMail() from here.
//
// Emails are OPTIONAL: if they are not configured in .env,
// we simply skip sending and the app keeps working.
//
// Two ways to send (see backend/.env.example):
// 1. EMAIL_RELAY_URL + EMAIL_RELAY_SECRET set: ask our Vercel function
//    (frontend/api/send-email.js) to send it. Needed because Render's free plan
//    blocks email (SMTP) ports. We use this both locally and on Render so both behave the same.
// 2. Otherwise EMAIL_USER + EMAIL_PASS: send straight through Gmail with nodemailer.
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const relayUrl = process.env.EMAIL_RELAY_URL;
const relaySecret = process.env.EMAIL_RELAY_SECRET;

const transporter = emailUser && emailPass
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } })
  : null;

function sendMail(to, subject, html) {
  if (!to) return;

  // We don't "await" on purpose: the user should not wait for the email to be sent.
  if (relayUrl && relaySecret) {
    fetch(relayUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-email-secret': relaySecret },
      body: JSON.stringify({ to, subject, html }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.ok) console.log('Email sent to', to);
        else console.log('Email failed:', data.message || response.status);
      })
      .catch((error) => console.log('Email failed:', error.message));
    return;
  }

  if (!transporter) return; // email not configured, nothing to do
  transporter.sendMail({ from: emailUser, to, subject, html }, (error) => {
    if (error) console.log('Email failed:', error.message);
    else console.log('Email sent to', to);
  });
}

module.exports = { sendMail };

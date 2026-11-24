// One place to send emails from. Every route uses sendMail() from here.
//
// Emails are OPTIONAL: if EMAIL_USER / EMAIL_PASS are not set in .env,
// we simply skip sending and the app keeps working.
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

const transporter = emailUser && emailPass
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } })
  : null;

function sendMail(to, subject, html) {
  if (!transporter || !to) return; // email not configured, nothing to do

  // We don't "await" this on purpose: the user should not wait for the email to be sent.
  transporter.sendMail({ from: emailUser, to, subject, html }, (error) => {
    if (error) console.log('Email failed:', error.message);
    else console.log('Email sent to', to);
  });
}

module.exports = { sendMail };

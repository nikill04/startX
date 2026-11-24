// Routes for the admin dashboard
// (New to Express/Mongoose? See 1_Dummy_AuthExplain.js, 2_... and 3_... in this folder.)
const express = require('express');
const Startup = require('../../models/startupmodel');
const EIR = require('../../models/EirSchema');
const GrantScheme = require('../../models/GrandSchemeSchema');
const Message = require('../../models/adminmessages');
const Reviewer = require('../../models/reviewers');
const { sendMail } = require('../../utils/mailer');

const router = express.Router();

// Admin username/password come from .env (defaults: admin / 12345)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345';

// The statuses an EIR or grant application can have, and the email we send for each one
const STATUS_EMAILS = {
  'Approved': 'Congratulations! Your application has been approved.',
  'Rejected': 'We regret to inform you that your application has been rejected.',
  'Short Listed': 'Good news! Your application has been short-listed.',
  'Under Review': 'Your application is under review. We will notify you of any updates.',
};

// POST /admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ message: 'Login successful' });
  }
  res.status(401).json({ message: 'Wrong Credentials' });
});

// GET /admin/startups  -> all startups
router.get('/startups', async (req, res) => {
  try {
    const startups = await Startup.find({});
    res.status(200).json(startups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch startups' });
  }
});

// GET /admin/progress/:startup  -> monthly progress reports of one startup
router.get('/progress/:startup', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.startup);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }
    res.status(200).json(startup.progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /admin/messages/:startupId  -> chat history with one startup (an array of messages)
router.get('/messages/:startupId', async (req, res) => {
  try {
    const chat = await Message.findOne({ startup_id: req.params.startupId });
    res.status(200).json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------- EIR applications -------------------------

// GET /admin/eir-requests  -> all EIR applications
router.get('/eir-requests', async (req, res) => {
  try {
    const eirRequests = await EIR.find({});
    res.status(200).json(eirRequests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch EIR requests' });
  }
});

// GET /admin/eir/:id  -> one EIR application
router.get('/eir/:id', async (req, res) => {
  try {
    const eir = await EIR.findById(req.params.id);
    if (!eir) {
      return res.status(404).json({ message: 'EIR request not found' });
    }
    res.status(200).json(eir);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/eir/status  body: { id, status }  -> approve / reject / shortlist
router.post('/eir/status', async (req, res) => {
  const { id, status } = req.body;
  if (!STATUS_EMAILS[status]) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const eir = await EIR.findByIdAndUpdate(
      id,
      { $set: { 'status.status': status, 'status.decision_date': new Date() } },
      { new: true } // return the updated document
    );
    if (!eir) {
      return res.status(404).json({ message: 'EIR request not found' });
    }
    sendMail(eir.entrepreneur.email, `Your EIR application is ${status}`, `<h1>${STATUS_EMAILS[status]}</h1>`);
    res.status(200).json(eir);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// POST /admin/eir/selectreviewer/:id  body: [reviewerId, ...]
router.post('/eir/selectreviewer/:id', async (req, res) => {
  try {
    const eir = await EIR.findById(req.params.id);
    if (!eir) {
      return res.status(404).json({ message: 'EIR request not found' });
    }
    await updateReviewers(eir, req.body, 'reviews');
    eir.status.status = 'Under Review';
    await eir.save();
    res.status(200).json({ message: 'Reviewers updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update reviewers' });
  }
});

// ------------------------- Grant applications -------------------------

// GET /admin/grant-requests  -> all grant applications
router.get('/grant-requests', async (req, res) => {
  try {
    const grants = await GrantScheme.find({});
    res.status(200).json(grants);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch grant requests' });
  }
});

// GET /admin/grant/:id  -> one grant application
router.get('/grant/:id', async (req, res) => {
  try {
    const grant = await GrantScheme.findById(req.params.id);
    if (!grant) {
      return res.status(404).json({ message: 'Grant request not found' });
    }
    res.status(200).json(grant);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/grant/status  body: { id, status }  -> approve / reject / shortlist
router.post('/grant/status', async (req, res) => {
  const { id, status } = req.body;
  if (!STATUS_EMAILS[status]) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const grant = await GrantScheme.findByIdAndUpdate(
      id,
      { $set: { 'grant_status.status': status, 'grant_status.decision_date': new Date() } },
      { new: true }
    );
    if (!grant) {
      return res.status(404).json({ message: 'Grant request not found' });
    }
    sendMail(grant.applicant.contact_details.email, `Your grant application is ${status}`, `<h1>${STATUS_EMAILS[status]}</h1>`);
    res.status(200).json(grant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// POST /admin/grant/selectreviewer/:id  body: [reviewerId, ...]
router.post('/grant/selectreviewer/:id', async (req, res) => {
  try {
    const grant = await GrantScheme.findById(req.params.id);
    if (!grant) {
      return res.status(404).json({ message: 'Grant request not found' });
    }
    await updateReviewers(grant, req.body, 'grantsreviews');
    grant.grant_status.status = 'Under Review';
    grant.grant_status.decision_date = new Date();
    await grant.save();
    res.status(200).json({ message: 'Reviewers updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update reviewers' });
  }
});

// ------------------------- Helper -------------------------

// Makes the reviewers of an application exactly match "selectedIds".
//   application: an EIR or GrantScheme document (it has a "reviews" list)
//   listName:    the list in the Reviewer document that remembers this application
//                ('reviews' for EIR, 'grantsreviews' for grants)
// The caller saves the application afterwards.
async function updateReviewers(application, selectedIds, listName) {
  const applicationId = application._id.toString();
  const currentIds = application.reviews.map((review) => review.reviewer_id);

  // 1. Add reviewers that were newly selected
  for (const reviewerId of selectedIds) {
    if (currentIds.includes(reviewerId)) continue;

    const reviewer = await Reviewer.findById(reviewerId);
    if (!reviewer) continue;

    reviewer[listName].push({ id: applicationId });
    await reviewer.save();

    application.reviews.push({
      reviewer_id: reviewerId,
      reviewer_name: reviewer.name,
      reviewer_email: reviewer.email,
      reviewer_organization: reviewer.organization,
      status: 'pending',
      rating: 0,
    });
  }

  // 2. Remove reviewers that were unselected
  for (const reviewerId of currentIds) {
    if (selectedIds.includes(reviewerId)) continue;
    await Reviewer.findByIdAndUpdate(reviewerId, { $pull: { [listName]: { id: applicationId } } });
  }
  application.reviews = application.reviews.filter((review) => selectedIds.includes(review.reviewer_id));
}

module.exports = router;

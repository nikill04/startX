// Routes for reviewers (people who rate EIR and grant applications)
const express = require('express');
const bcrypt = require('bcrypt');
const Reviewer = require('../../models/reviewers');
const EIR = require('../../models/EirSchema');
const GrantScheme = require('../../models/GrandSchemeSchema');
const { sendMail } = require('../../utils/mailer');

const router = express.Router();

// Creates a reviewer (used by both "register" and the admin's "add reviewer")
async function createReviewer({ name, email, password, organization, about }) {
  const exists = await Reviewer.findOne({ email });
  if (exists) return null;

  const hashedPassword = await bcrypt.hash(password, 10);
  const reviewer = await Reviewer.create({ name, email, password: hashedPassword, organization, about });
  sendMail(email, 'StartX reviewer account', '<h1>You are registered as a reviewer on StartX</h1>');
  return reviewer;
}

// POST /review/register  -> a reviewer signs up
router.post('/register', async (req, res) => {
  try {
    const reviewer = await createReviewer(req.body);
    if (!reviewer) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(200).json({ message: 'Registration successful!', reviewerId: reviewer._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to register reviewer' });
  }
});

// POST /review/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const reviewer = await Reviewer.findOne({ email });
    if (!reviewer) {
      return res.status(400).json({ message: 'Reviewer not found' });
    }

    const passwordMatches = await bcrypt.compare(password, reviewer.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', reviewerId: reviewer._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log in' });
  }
});

// POST /review/add-reviewer  -> the admin adds a reviewer
router.post('/add-reviewer', async (req, res) => {
  try {
    const reviewer = await createReviewer(req.body);
    if (!reviewer) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const { password, ...reviewerWithoutPassword } = reviewer.toObject();
    res.status(201).json(reviewerWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reviewer' });
  }
});

// GET /review/reviewers  -> all reviewers (without their passwords)
router.get('/reviewers', async (req, res) => {
  try {
    const reviewers = await Reviewer.find().select('-password');
    res.status(200).json(reviewers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviewers' });
  }
});

// GET /review/:reviewerId/reviews  -> EIR applications assigned to this reviewer
router.get('/:reviewerId/reviews', async (req, res) => {
  try {
    const applications = await EIR.find({ 'reviews.reviewer_id': req.params.reviewerId });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch EIR applications' });
  }
});

// GET /review/:reviewerId/grantreviews  -> grant applications assigned to this reviewer
router.get('/:reviewerId/grantreviews', async (req, res) => {
  try {
    const applications = await GrantScheme.find({ 'reviews.reviewer_id': req.params.reviewerId });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch grant applications' });
  }
});

// Saves a reviewer's rating + comment on an application (EIR or grant)
async function saveReview(application, reviewerId, rating, comment) {
  const review = application.reviews.find((r) => r.reviewer_id === reviewerId);
  if (!review) return false;

  review.rating = rating;
  if (comment) review.comments.push(comment);
  review.status = 'completed';
  review.review_date = new Date();
  await application.save();
  return true;
}

// POST /review/eir/:eirId/:reviewerId  body: { rating, comment }
router.post('/eir/:eirId/:reviewerId', async (req, res) => {
  try {
    const eir = await EIR.findById(req.params.eirId);
    if (!eir) {
      return res.status(404).json({ message: 'EIR application not found' });
    }
    const saved = await saveReview(eir, req.params.reviewerId, req.body.rating, req.body.comment);
    if (!saved) {
      return res.status(403).json({ message: 'You are not a reviewer of this application' });
    }
    res.status(200).json(eir);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// POST /review/grants/:grantId/:reviewerId  body: { rating, comment }
router.post('/grants/:grantId/:reviewerId', async (req, res) => {
  try {
    const grant = await GrantScheme.findById(req.params.grantId);
    if (!grant) {
      return res.status(404).json({ message: 'Grant application not found' });
    }
    const saved = await saveReview(grant, req.params.reviewerId, req.body.rating, req.body.comment);
    if (!saved) {
      return res.status(403).json({ message: 'You are not a reviewer of this application' });
    }
    res.status(200).json(grant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

module.exports = router;

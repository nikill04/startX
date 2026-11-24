// Forms a startup can submit: EIR application, grant application, monthly progress report
const express = require('express');
const EIR = require('../../models/EirSchema');
const GrantScheme = require('../../models/GrandSchemeSchema');
const Startup = require('../../models/startupmodel');

const router = express.Router();

// POST /submit/eir/:startup  -> new EIR (Entrepreneur In Residence) application
router.post('/eir/:startup', async (req, res) => {
  const { entrepreneur, startup_name, objectives } = req.body;
  try {
    const eir = await EIR.create({
      startup_id: req.params.startup,
      entrepreneur,
      startup_name,
      objectives,
    });
    res.status(201).json(eir);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit EIR application' });
  }
});

// POST /submit/funds/:startup  -> new grant application
router.post('/funds/:startup', async (req, res) => {
  const {
    name, organization, email, phone, pan, aadhar, address,
    project_title, description, total_funding_required, funding_breakdown,
  } = req.body;
  try {
    const grant = await GrantScheme.create({
      startup_id: req.params.startup,
      applicant: {
        name,
        organization,
        pan,
        aadhar_num: aadhar,
        contact_details: { email, phone, address },
      },
      project_proposal: {
        project_title,
        description,
        budget: { total_funding_required, funding_breakdown },
      },
    });
    res.status(201).json({ message: 'Grant application submitted successfully!', grant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit grant application' });
  }
});

// POST /submit/reports/:startup  -> add a monthly progress report
router.post('/reports/:startup', async (req, res) => {
  const { month, milestones, issues, financials } = req.body;
  try {
    const startup = await Startup.findById(req.params.startup);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    startup.progress.push({ month, milestones, issues_faced: issues, financials });
    await startup.save();
    res.status(200).json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save progress report' });
  }
});

module.exports = router;

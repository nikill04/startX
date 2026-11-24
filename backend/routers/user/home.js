// Data for the startup's dashboard
const express = require('express');
const User = require('../../models/usermodel');
const Startup = require('../../models/startupmodel');
const EIR = require('../../models/EirSchema');
const GrantScheme = require('../../models/GrandSchemeSchema');

const router = express.Router();

// GET /user/home/:user/:startup  -> everything the startup dashboard needs, in one request
router.get('/home/:user/:startup', async (req, res) => {
  try {
    const user = await User.findById(req.params.user).select('-password'); // never send passwords
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const startup = await Startup.findById(req.params.startup);
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    const eirRecords = await EIR.find({ startup_id: req.params.startup });
    const grantRecords = await GrantScheme.find({ startup_id: req.params.startup });

    res.status(200).json({ user, startup, eirRecords, grantRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

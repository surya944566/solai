const express = require('express');
const auth = require('./auth');
const dashboard = require('./dashboard');
const users = require('./users');
const profiles = require('./profiles');
const enquiries = require('./enquiries');
const support = require('./support');
const reports = require('./reports');
const settings = require('./settings');
const activity = require('./activity');

const router = express.Router();

router.use('/auth', auth);
router.use('/dashboard', dashboard);
router.use('/users', users);
router.use('/profiles', profiles);
router.use('/enquiries', enquiries);
router.use('/support', support);
router.use('/reports', reports);
router.use('/settings', settings.router);
router.use('/activity', activity);

module.exports = router;
const express = require('express');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../utils/helpers');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
}));

module.exports = router;
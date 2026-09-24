const express = require('express');
const ActivityLog = require('../../models/ActivityLog');
const { asyncHandler } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(protectAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('admin', 'name email')
    .lean();
  res.json({ success: true, data: logs });
}));

module.exports = router;
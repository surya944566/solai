const express = require('express');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../utils/helpers');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ user: req.user._id }),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unread,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, count });
}));

router.put('/:id/read', asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true, readAt: new Date() },
    { new: true }
  );
  if (!notif) throw AppError('Notification not found', 404);
  res.json({ success: true, data: notif });
}));

router.put('/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true, readAt: new Date() });
  res.json({ success: true });
}));

module.exports = router;
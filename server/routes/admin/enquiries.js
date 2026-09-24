const express = require('express');
const Enquiry = require('../../models/Enquiry');
const Notification = require('../../models/Notification');
const ActivityLog = require('../../models/ActivityLog');
const { asyncHandler, AppError } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(protectAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const q = {};
  const { search, status } = req.query;
  if (search) {
    const users = await require('../../models/User').find({
      $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { mobile: new RegExp(search, 'i') }],
    }).select('_id');
    const profiles = await require('../../models/MatrimonialProfile').find({
      $or: [{ profileId: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }],
    }).select('_id');
    q.$or = [{ user: { $in: users.map((u) => u._id) } }, { profile: { $in: profiles.map((p) => p._id) } }];
  }
  if (status) q.status = status;

  const [enquiries, total] = await Promise.all([
    Enquiry.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email mobile')
      .populate('profile', 'profileId name gender age maritalStatus location')
      .lean(),
    Enquiry.countDocuments(q),
  ]);

  res.json({ success: true, data: enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id)
    .populate('user', 'name email mobile lastLoginAt')
    .populate('profile', 'profileId name gender age maritalStatus location profilePhoto education occupation')
    .lean();
  if (!enquiry) throw AppError('Enquiry not found', 404);
  res.json({ success: true, data: enquiry });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id);
  if (!enquiry) throw AppError('Enquiry not found', 404);

  const { status, adminReply, internalNotes } = req.body;
  const previousStatus = enquiry.status;
  if (status && status !== enquiry.status) {
    enquiry.status = status;
    enquiry.history.push({ status, note: `Status changed to ${status}` });
  }
  if (adminReply) {
    enquiry.adminReply = adminReply;
    enquiry.repliedAt = new Date();
    enquiry.history.push({ status: enquiry.status, note: 'Admin replied' });
  }
  if (internalNotes !== undefined) enquiry.internalNotes = internalNotes;

  await enquiry.save();

  if (status && status !== previousStatus) {
    await Notification.create({
      user: enquiry.user,
      type: 'enquiry_status',
      title: 'Enquiry Status Updated',
      message: `Your enquiry for ${enquiry.profile} is now "${status}".`,
      link: '/dashboard/enquiries',
    });
    require('../../socket/emitter').emitUserEvent(`user:${enquiry.user}`, 'notification', { title: 'Enquiry Status Updated' });
  }
  if (adminReply) {
    await Notification.create({
      user: enquiry.user,
      type: 'admin_reply',
      title: 'Admin Reply',
      message: `Admin replied to your enquiry: "${adminReply.slice(0, 100)}"`,
      link: '/dashboard/enquiries',
    });
  }

  await ActivityLog.create({ admin: req.admin._id, action: 'enquiry_update', module: 'enquiries', description: `Updated enquiry ${enquiry._id}`, targetType: 'Enquiry', targetId: enquiry._id, ip: req.ip }).catch(() => {});

  res.json({ success: true, data: enquiry });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) throw AppError('Enquiry not found', 404);
  res.json({ success: true, message: 'Enquiry deleted' });
}));

module.exports = router;
const express = require('express');
const SupportConversation = require('../../models/SupportConversation');
const SupportMessage = require('../../models/SupportMessage');
const Notification = require('../../models/Notification');
const ActivityLog = require('../../models/ActivityLog');
const { asyncHandler, AppError } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');
const { emitUserEvent } = require('../../socket/emitter');

const router = express.Router();

router.use(protectAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;

  const q = {};
  const { search, status } = req.query;
  if (status) q.status = status;
  if (search) {
    const users = await require('../../models/User').find({
      $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { mobile: new RegExp(search, 'i') }],
    }).select('_id');
    q.user = { $in: users.map((u) => u._id) };
  }

  const [conversations, total] = await Promise.all([
    SupportConversation.find(q)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email mobile')
      .lean(),
    SupportConversation.countDocuments(q),
  ]);

  res.json({ success: true, data: conversations, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findById(req.params.id).populate('user', 'name email mobile').lean();
  if (!conversation) throw AppError('Conversation not found', 404);

  const messages = await SupportMessage.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();
  await SupportMessage.updateMany({ conversation: conversation._id, sender: 'user', readByAdmin: false }, { readByAdmin: true });
  conversation.unreadForAdmin = 0;
  await SupportConversation.updateOne({ _id: conversation._id }, { unreadForAdmin: 0 });

  res.json({ success: true, data: { conversation, messages } });
}));

router.post('/:id/messages', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findById(req.params.id);
  if (!conversation) throw AppError('Conversation not found', 404);
  if (conversation.status === 'blocked') throw AppError('This conversation is blocked', 403);

  const { body } = req.body;
  if (!body || !body.trim()) throw AppError('Message body is required', 400);

  const message = await SupportMessage.create({
    conversation: conversation._id,
    sender: 'admin',
    senderName: req.admin.name,
    admin: req.admin._id,
    body: body.trim(),
  });

  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = body.trim().slice(0, 120);
  conversation.status = 'open';
  conversation.unreadForUser = (conversation.unreadForUser || 0) + 1;
  await conversation.save();

  await Notification.create({
    user: conversation.user,
    type: 'support_message',
    title: 'Support Reply',
    message: `You have a new message from the support team.`,
    link: '/dashboard/support',
  });

  emitUserEvent(`user:${conversation.user}`, 'support:new_message', { conversation: conversation._id, message });

  res.status(201).json({ success: true, data: message });
}));

router.put('/:id/close', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findById(req.params.id);
  if (!conversation) throw AppError('Conversation not found', 404);
  conversation.status = 'closed';
  conversation.closedAt = new Date();
  conversation.closedBy = req.admin._id;
  await conversation.save();

  await ActivityLog.create({ admin: req.admin._id, action: 'support_close', module: 'support', description: `Closed support conversation`, targetType: 'SupportConversation', targetId: conversation._id, ip: req.ip }).catch(() => {});

  res.json({ success: true, data: conversation });
}));

router.put('/:id/block', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findById(req.params.id);
  if (!conversation) throw AppError('Conversation not found', 404);
  conversation.status = 'blocked';
  await conversation.save();
  res.json({ success: true, data: conversation });
}));

router.put('/:id/notes', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findById(req.params.id);
  if (!conversation) throw AppError('Conversation not found', 404);
  conversation.internalNotes = req.body.notes || '';
  await conversation.save();
  res.json({ success: true, data: conversation });
}));

router.get('/user/:userId/conversation', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findOne({ user: req.params.userId }).sort({ createdAt: -1 }).lean();
  if (!conversation) throw AppError('Conversation not found', 404);
  res.json({ success: true, data: conversation });
}));

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const SupportConversation = require('../models/SupportConversation');
const SupportMessage = require('../models/SupportMessage');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../utils/helpers');
const { protect } = require('../middleware/auth');
const { emitToAdmins } = require('../socket/emitter');

const router = express.Router();

router.use(protect);

const USER_SAFE_FIELDS = '-internalNotes -unreadForAdmin -closedBy';

router.get('/conversations', asyncHandler(async (req, res) => {
  const conversations = await SupportConversation.find({ user: req.user._id })
    .select(USER_SAFE_FIELDS)
    .sort({ lastMessageAt: -1 })
    .lean();
  res.json({ success: true, data: conversations });
}));

router.post(
  '/conversations',
  [body('subject').optional().isLength({ max: 200 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const existing = await SupportConversation.findOne({ user: req.user._id, status: 'open' }).select(USER_SAFE_FIELDS);
    if (existing) return res.json({ success: true, data: existing });

    const conversation = await SupportConversation.create({
      user: req.user._id,
      subject: req.body.subject || 'Support request',
    });
    emitToAdmins('support:new_conversation', { conversation });
    const safe = conversation.toObject();
    delete safe.internalNotes;
    delete safe.unreadForAdmin;
    delete safe.closedBy;
    res.status(201).json({ success: true, data: safe });
  })
);

router.get('/conversations/:id/messages', asyncHandler(async (req, res) => {
  const conversation = await SupportConversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) throw AppError('Conversation not found', 404);

  const messages = await SupportMessage.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();

  await SupportMessage.updateMany(
    { conversation: conversation._id, sender: 'admin', readByUser: false },
    { readByUser: true }
  );
  conversation.unreadForUser = 0;
  await conversation.save();

  const safeConversation = {
    ...conversation.toObject(),
    internalNotes: undefined,
    unreadForAdmin: undefined,
    closedBy: undefined,
  };

  res.json({ success: true, data: { conversation: safeConversation, messages } });
}));

router.post(
  '/conversations/:id/messages',
  [body('body').notEmpty().withMessage('Message is required').isLength({ max: 2000 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const conversation = await SupportConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) throw AppError('Conversation not found', 404);
    if (conversation.status === 'closed') throw AppError('This conversation is closed', 400);
    if (conversation.status === 'blocked') throw AppError('This conversation has been blocked', 403);

    const message = await SupportMessage.create({
      conversation: conversation._id,
      sender: 'user',
      senderName: req.user.name,
      body: req.body.body,
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = req.body.body.slice(0, 120);
    conversation.unreadForAdmin = (conversation.unreadForAdmin || 0) + 1;
    conversation.status = 'open';
    await conversation.save();

    emitToAdmins('support:new_message', { conversation: conversation._id, message });

    res.status(201).json({ success: true, data: message });
  })
);

module.exports = router;
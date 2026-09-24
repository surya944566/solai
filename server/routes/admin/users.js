const express = require('express');
const bcrypt = require('bcryptjs');
const { query, body, validationResult } = require('express-validator');
const User = require('../../models/User');
const ActivityLog = require('../../models/ActivityLog');
const Notification = require('../../models/Notification');
const { asyncHandler, AppError } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(protectAdmin);

async function logActivity(req, action, module, description, targetType, targetId) {
  try {
    await ActivityLog.create({
      admin: req.admin._id,
      action,
      module,
      description,
      targetType,
      targetId,
      ip: req.ip,
    });
  } catch (e) {
    console.error('log activity failed', e.message);
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const q = {};
  const { search, keyword, status, sort } = req.query;
  const query = search || keyword;
  if (query) {
    q.$or = [
      { name: new RegExp(query, 'i') },
      { email: new RegExp(query, 'i') },
      { mobile: new RegExp(query, 'i') },
    ];
  }
  if (status) q.status = status;

  const sortBy = { newest: { createdAt: -1 }, active: { lastLoginAt: -1 } }[sort] || { createdAt: -1 };

  const [users, total] = await Promise.all([
    User.find(q).sort(sortBy).skip(skip).limit(limit).populate('loginHistory').lean(),
    User.countDocuments(q),
  ]);

  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('emailOrMobile').notEmpty().withMessage('Email or mobile is required'),
    body('password').optional({ values: 'falsy' }).isLength({ min: 6 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, emailOrMobile, password, status } = req.body;
    const isEmail = emailOrMobile.includes('@');
    const email = isEmail ? emailOrMobile.toLowerCase() : undefined;
    const mobile = isEmail ? undefined : emailOrMobile;

    const exists = await User.findOne(isEmail ? { email } : { mobile });
    if (exists) throw AppError('A user with this email/mobile already exists', 409);

    const generatedPassword = password || Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(generatedPassword, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashed,
      status: status || 'active',
      isAdminCreated: true,
    });

    await logActivity(req, 'user_create', 'users', `Created user ${user.name}`, 'User', user._id);

    res.status(201).json({
      success: true,
      data: user,
      generatedPassword: password ? undefined : generatedPassword,
    });
  })
);

router.put('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError('User not found', 404);

  const { name, email, mobile, status } = req.body;
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (mobile) user.mobile = mobile;
  if (status) user.status = status;
  await user.save();

  await logActivity(req, 'user_update', 'users', `Updated user ${user.name}`, 'User', user._id);
  res.json({ success: true, data: user });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw AppError('User not found', 404);

  await Promise.all([
    Notification.deleteMany({ user: user._id }),
    require('../../models/Enquiry').deleteMany({ user: user._id }),
    require('../../models/SavedProfile').deleteMany({ user: user._id }),
    require('../../models/SupportConversation').deleteMany({ user: user._id }),
    require('../../models/SupportMessage').deleteMany({ user: user._id }),
  ]);

  await logActivity(req, 'user_delete', 'users', `Deleted user ${user.name}`, 'User', user._id);
  res.json({ success: true, message: 'User deleted' });
}));

router.put('/:id/block', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError('User not found', 404);

  user.status = 'blocked';
  await user.save();

  await Notification.create({
    user: user._id,
    type: 'account_status',
    title: 'Account Blocked',
    message: 'Your account has been blocked. Please contact support for more information.',
  });

  await logActivity(req, 'user_block', 'users', `Blocked user ${user.name}`, 'User', user._id);
  res.json({ success: true, data: user });
}));

router.put('/:id/activate', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError('User not found', 404);

  user.status = 'active';
  await user.save();

  await Notification.create({
    user: user._id,
    type: 'account_status',
    title: 'Account Activated',
    message: 'Your account has been activated. Welcome back!',
  });

  await logActivity(req, 'user_activate', 'users', `Activated user ${user.name}`, 'User', user._id);
  res.json({ success: true, data: user });
}));

router.put('/:id/reset-password', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw AppError('User not found', 404);

  const newPassword = req.body.password || Math.random().toString(36).slice(-8);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await logActivity(req, 'user_reset_password', 'users', `Reset password for ${user.name}`, 'User', user._id);

  res.json({ success: true, message: 'Password reset', newPassword: req.body.password ? undefined : newPassword });
}));

router.get('/:id/login-history', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name email mobile loginHistory lastLoginAt');
  if (!user) throw AppError('User not found', 404);
  res.json({ success: true, data: user });
}));

router.get('/:id/enquiries', asyncHandler(async (req, res) => {
  const enquiries = await require('../../models/Enquiry')
    .find({ user: req.params.id })
    .populate('profile', 'profileId name gender age')
    .lean();
  res.json({ success: true, data: enquiries });
}));

module.exports = router;
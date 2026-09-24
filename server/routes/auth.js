const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SiteSetting = require('../models/SiteSetting');
const { signUserToken, asyncHandler, AppError } = require('../utils/helpers');
const { protect } = require('../middleware/auth');

const router = express.Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

async function buildAdminContactFields() {
  const settings = await SiteSetting.find({ key: { $in: ['office_name', 'office_phone', 'office_address'] } });
  const map = {};
  settings.forEach((s) => (map[s.key] = s.value));
  return {
    officeName: map.office_name || 'Solai Matrimony Office',
    officePhone: map.office_phone || '+91 00000 00000',
    officeAddress: map.office_address || '123, Marriage Street, Chennai, Tamil Nadu',
  };
}

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
    body('emailOrMobile').notEmpty().withMessage('Email or mobile is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, emailOrMobile, password } = req.body;

    let query = { mobile: emailOrMobile };
    let email;
    if (emailOrMobile.includes('@')) {
      email = emailOrMobile.toLowerCase();
      query = { email };
    }

    let existing = await User.findOne(query);
    if (existing) throw AppError('An account with this email/mobile already exists', 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      mobile: emailOrMobile.includes('@') ? undefined : emailOrMobile,
      password: hashed,
    });

    await SiteSetting.bulkWrite(
      ['office_name', 'office_phone', 'office_address'].map((key) => ({
        updateOne: {
          filter: { key },
          update: { $setOnInsert: { key, group: 'contact', label: key.split('_').join(' ') } },
          upsert: true,
        },
      }))
    );

    const adminContact = await buildAdminContactFields();
    const token = signUserToken(user);

    res.status(201).json({ success: true, token, user, adminContact });
  })
);

router.post(
  '/login',
  [
    body('emailOrMobile').notEmpty().withMessage('Email or mobile is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { emailOrMobile, password, rememberMe } = req.body;
    const isEmail = emailOrMobile.includes('@');

    const query = isEmail ? { email: emailOrMobile.toLowerCase() } : { mobile: emailOrMobile };
    const user = await User.findOne(query).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw AppError('Invalid email/mobile or password', 401);
    }

    if (user.status === 'blocked') throw AppError('Your account has been blocked. Contact support.', 403);
    if (user.status === 'pending') throw AppError('Your account is pending approval. Contact support.', 403);

    user.lastLoginAt = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({ at: new Date(), ip: req.ip, userAgent: req.get('user-agent') });
    if (user.loginHistory.length > 50) user.loginHistory = user.loginHistory.slice(-50);
    await user.save();

    const token = signUserToken(user, rememberMe);
    const adminContact = await buildAdminContactFields();

    res.json({ success: true, token, user, adminContact });
  })
);

router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
}));

router.put(
  '/me',
  protect,
  [
    body('name').optional().isLength({ max: 100 }),
    body('mobile').optional(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (req.body.name) user.name = req.body.name;
    if (req.body.mobile) user.mobile = req.body.mobile;
    await user.save();
    res.json({ success: true, user });
  })
);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) throw AppError('User not found', 404);

    const ok = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!ok) throw AppError('Current password is incorrect', 400);

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  })
);

router.get('/admin-contact', asyncHandler(async (_req, res) => {
  res.json({ success: true, adminContact: await buildAdminContactFields() });
}));

module.exports = router;
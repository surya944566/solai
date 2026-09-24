const express = require('express');
const { body, validationResult } = require('express-validator');
const MatrimonialProfile = require('../models/MatrimonialProfile');
const SavedProfile = require('../models/SavedProfile');
const Enquiry = require('../models/Enquiry');
const { asyncHandler, AppError } = require('../utils/helpers');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const VISIBLE_STATUSES = ['published', 'featured'];

// Sensitive fields never exposed through public browsing endpoints.
const PUBLIC_FIELDS = '-phone -email -reports -viewLogs';

function visibleQuery(extra = {}) {
  return { status: { $in: VISIBLE_STATUSES }, ...extra };
}

async function annotateUserState(req, profiles) {
  if (!req.user || !Array.isArray(profiles) || !profiles.length) return;
  const ids = profiles.map((p) => p._id);
  const [saved, enquiries] = await Promise.all([
    SavedProfile.find({ user: req.user._id, profile: { $in: ids } }).select('profile').lean(),
    Enquiry.find({ user: req.user._id, profile: { $in: ids }, status: { $in: ['pending', 'contacted', 'in_progress'] } }).select('profile').lean(),
  ]);
  const savedSet = new Set(saved.map((s) => String(s.profile)));
  const enquirySet = new Set(enquiries.map((e) => String(e.profile)));
  profiles.forEach((p) => {
    p.saved = savedSet.has(String(p._id));
    p.enquiryExists = enquirySet.has(String(p._id));
  });
}

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const q = visibleQuery();

    const { gender, minAge, maxAge, location, district, state, education, occupation, maritalStatus, height, profileId, keyword, category, sort } = req.query;

    if (gender) q.gender = gender;
    if (maritalStatus) q.maritalStatus = maritalStatus;
    if (category === 'male') q.gender = 'male';
    if (category === 'female') q.gender = 'female';
    if (category === 'married') q.maritalStatus = 'married';
    if (category === 'featured') q.status = 'featured';

    if (location) q.location = new RegExp(location.trim(), 'i');
    if (district) q.district = new RegExp(district.trim(), 'i');
    if (state) q.state = new RegExp(state.trim(), 'i');
    if (education) q.education = new RegExp(education.trim(), 'i');
    if (occupation) q.occupation = new RegExp(occupation.trim(), 'i');
    if (height) q.height = new RegExp(height.trim(), 'i');
    if (profileId) q.profileId = new RegExp(profileId.trim(), 'i');

    if (minAge || maxAge) {
      q.age = {};
      if (minAge) q.age.$gte = parseInt(minAge);
      if (maxAge) q.age.$lte = parseInt(maxAge);
    }
    if (keyword) {
      q.$or = [
        { name: new RegExp(keyword.trim(), 'i') },
        { profileId: new RegExp(keyword.trim(), 'i') },
        { location: new RegExp(keyword.trim(), 'i') },
        { education: new RegExp(keyword.trim(), 'i') },
        { occupation: new RegExp(keyword.trim(), 'i') },
      ];
    }

    const sortBy = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      views: { views: -1 },
      name_asc: { name: 1 },
    }[sort] || { createdAt: -1 };

    const [profiles, total] = await Promise.all([
      MatrimonialProfile.find(q).select(PUBLIC_FIELDS).sort(sortBy).skip(skip).limit(limit).lean(),
      MatrimonialProfile.countDocuments(q),
    ]);

    await annotateUserState(req, profiles);

    res.json({
      success: true,
      data: profiles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

router.get('/featured', optionalAuth, asyncHandler(async (req, res) => {
  const profiles = await MatrimonialProfile.find({ status: 'featured' }).select(PUBLIC_FIELDS).sort({ updatedAt: -1 }).limit(8).lean();
  await annotateUserState(req, profiles);
  res.json({ success: true, data: profiles });
}));

router.get('/male', optionalAuth, asyncHandler(async (req, res) => {
  const profiles = await MatrimonialProfile.find(visibleQuery({ gender: 'male' })).select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(8).lean();
  await annotateUserState(req, profiles);
  res.json({ success: true, data: profiles });
}));

router.get('/female', optionalAuth, asyncHandler(async (req, res) => {
  const profiles = await MatrimonialProfile.find(visibleQuery({ gender: 'female' })).select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(8).lean();
  await annotateUserState(req, profiles);
  res.json({ success: true, data: profiles });
}));

router.get('/married', optionalAuth, asyncHandler(async (req, res) => {
  const profiles = await MatrimonialProfile.find(visibleQuery({ maritalStatus: 'married' })).select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(8).lean();
  await annotateUserState(req, profiles);
  res.json({ success: true, data: profiles });
}));

router.get('/latest', optionalAuth, asyncHandler(async (req, res) => {
  const profiles = await MatrimonialProfile.find(visibleQuery()).select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(8).lean();
  await annotateUserState(req, profiles);
  res.json({ success: true, data: profiles });
}));

router.get('/saved', protect, asyncHandler(async (req, res) => {
  const saved = await SavedProfile.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('profile', PUBLIC_FIELDS)
    .lean();
  const data = saved
    .map((s) => ({ ...s.profile, savedAt: s.createdAt }))
    .filter((p) => p && ['published', 'featured'].includes(p.status));
  res.json({ success: true, data });
}));

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const profile = await MatrimonialProfile.findOne(visibleQuery({ _id: req.params.id })).lean();
    if (!profile) throw AppError('Profile not found', 404);

    let saved = false;
    let enquiryExists = false;
    if (req.user) {
      saved = !!(await SavedProfile.exists({ user: req.user._id, profile: profile._id }));
      enquiryExists = !!(await Enquiry.exists({ user: req.user._id, profile: profile._id }));
    }

    const detail = {
      ...profile,
      saved,
      enquiryExists,
    };

    if (profile.contactVisibility === 'public') {
      detail.contactRevealed = { phone: profile.phone, email: profile.email };
    }
    delete detail.phone;
    delete detail.email;
    delete detail.reports;
    delete detail.viewLogs;

    res.json({ success: true, data: detail });
  })
);

router.post('/:id/save', protect, asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findOne(visibleQuery({ _id: req.params.id }));
  if (!profile) throw AppError('Profile not found', 404);

  const exists = await SavedProfile.findOne({ user: req.user._id, profile: profile._id });
  if (exists) return res.json({ success: true, saved: true, message: 'Profile already saved' });

  await SavedProfile.create({ user: req.user._id, profile: profile._id });
  res.status(201).json({ success: true, saved: true });
}));

router.delete('/:id/save', protect, asyncHandler(async (req, res) => {
  await SavedProfile.deleteOne({ user: req.user._id, profile: req.params.id });
  res.json({ success: true, saved: false });
}));

router.get('/:id/saved-state', protect, asyncHandler(async (req, res) => {
  const saved = !!(await SavedProfile.exists({ user: req.user._id, profile: req.params.id }));
  res.json({ success: true, saved });
}));

router.post(
  '/:id/report',
  protect,
  [body('reason').optional().isLength({ max: 500 })],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const profile = await MatrimonialProfile.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { reportCount: 1 },
        $push: {
          reports: {
            reason: req.body.reason || 'Inappropriate content',
            note: req.body.note,
            by: req.user._id,
          },
        },
      },
      { new: true }
    );
    if (!profile) throw AppError('Profile not found', 404);
    res.json({ success: true, message: 'Report submitted. Thank you for keeping Solai Matrimony safe.' });
  })
);

module.exports = router;
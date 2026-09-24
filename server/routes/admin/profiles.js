const express = require('express');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const ActivityLog = require('../../models/ActivityLog');
const Notification = require('../../models/Notification');
const upload = require('../../middleware/upload');
const { asyncHandler, AppError } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');
const { uploadDir } = require('../../config/env');

const router = express.Router();

router.use(protectAdmin);

async function logActivity(req, action, module, description, targetType, targetId) {
  try {
    await ActivityLog.create({ admin: req.admin._id, action, module, description, targetType, targetId, ip: req.ip });
  } catch (e) {}
}

function generateProfileId() {
  const time = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 90 + 10);
  return `SL${time}${rand}`;
}

const profileValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
];

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const q = {};
  const { search, keyword, status, category, gender, maritalStatus, featured } = req.query;
  const query = search || keyword;
  if (query) {
    q.$or = [
      { profileId: new RegExp(query, 'i') },
      { name: new RegExp(query, 'i') },
      { location: new RegExp(query, 'i') },
      { education: new RegExp(query, 'i') },
    ];
  }
  if (category === 'male') q.gender = 'male';
  if (category === 'female') q.gender = 'female';
  if (category === 'married') q.maritalStatus = 'married';
  if (category === 'featured') q.isFeatured = true;
  if (category === 'blocked') q.status = 'blocked';
  if (status) q.status = status;
  if (gender) q.gender = gender;
  if (maritalStatus) q.maritalStatus = maritalStatus;
  if (featured === 'true') q.isFeatured = true;

  const sortBy = { newest: { createdAt: -1 }, views: { views: -1 } }[req.query.sort] || { createdAt: -1 };

  const [profiles, total] = await Promise.all([
    MatrimonialProfile.find(q).sort(sortBy).skip(skip).limit(limit).lean(),
    MatrimonialProfile.countDocuments(q),
  ]);

  const savedCounts = req.query.sort === 'saves'
    ? await require('../../models/SavedProfile').aggregate([
        { $match: { profile: { $in: profiles.map((p) => p._id) } } },
        { $group: { _id: '$profile', count: { $sum: 1 } } },
      ])
    : [];
  const countMap = {};
  savedCounts.forEach((s) => (countMap[s._id] = s.count));
  profiles.forEach((p) => (p.savedCount = countMap[p._id] || 0));

  if (req.query.sort === 'saves') profiles.sort((a, b) => (b.savedCount || 0) - (a.savedCount || 0));

  res.json({ success: true, data: profiles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.post(
  '/',
  upload.array('photos', 8),
  profileValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      (req.files || []).forEach((f) => fs.unlinkSync(f.path));
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const body = req.body;
    let profileId = body.profileId || generateProfileId();
    if (await MatrimonialProfile.exists({ profileId })) {
      (req.files || []).forEach((f) => fs.unlinkSync(f.path));
      throw AppError('This Profile ID already exists', 409);
    }

    const photos = (req.files || []).map((f, i) => ({
      url: `/uploads/${f.filename}`,
      publicId: f.filename,
      isPrimary: i === 0,
      caption: body[`caption_${i}`] || '',
    }));

    const age = body.age || (body.dateOfBirth ? Math.floor((Date.now() - new Date(body.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined);

    const status = body.status || 'draft';
    const isFeatured = body.isFeatured === 'true' || body.isFeatured === true;

    const profile = await MatrimonialProfile.create({
      profileId,
      name: body.name.trim(),
      gender: body.gender,
      dateOfBirth: body.dateOfBirth || undefined,
      age: age && age > 17 ? age : undefined,
      profilePhoto: photos.find((p) => p.isPrimary)?.url || body.profilePhoto || '',
      photos,
      maritalStatus: body.maritalStatus || 'single',
      height: body.height || '',
      education: body.education || '',
      occupation: body.occupation || '',
      salary: body.salary || '',
      location: body.location || '',
      district: body.district || '',
      state: body.state || '',
      religion: body.religion || '',
      community: body.community || '',
      familyDetails: body.familyDetails || '',
      about: body.about || '',
      partnerExpectations: body.partnerExpectations || '',
      contactVisibility: body.contactVisibility || 'private',
      phone: body.phone || '',
      email: body.email || '',
      isFeatured,
      status: status === 'featured' ? (isFeatured ? 'featured' : 'published') : status,
      publishedAt: ['published', 'featured'].includes(status) ? new Date() : undefined,
    });

    await logActivity(req, 'profile_create', 'profiles', `Created profile ${profile.profileId}`, 'MatrimonialProfile', profile._id);

    res.status(201).json({ success: true, data: profile });
  })
);

router.put('/:id', upload.array('photos', 8), asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findById(req.params.id);
  if (!profile) throw AppError('Profile not found', 404);

  const body = req.body;
  const fields = [
    'name', 'gender', 'dateOfBirth', 'age', 'maritalStatus', 'height', 'education',
    'occupation', 'salary', 'location', 'district', 'state', 'religion', 'community',
    'familyDetails', 'about', 'partnerExpectations', 'contactVisibility', 'phone', 'email',
  ];
  fields.forEach((f) => {
    if (body[f] !== undefined) profile[f] = body[f];
  });

  if (body.profileId && body.profileId !== profile.profileId) {
    if (await MatrimonialProfile.exists({ profileId: body.profileId })) throw AppError('This Profile ID already exists', 409);
    profile.profileId = body.profileId;
  }

  const newPhotos = (req.files || []).map((f, i) => ({
    url: `/uploads/${f.filename}`,
    publicId: f.filename,
    isPrimary: profile.photos.length === 0 && i === 0,
    caption: body[`caption_new_${i}`] || '',
  }));
  if (newPhotos.length) profile.photos.push(...newPhotos);

  if (body.removePhotos) {
    const removeIds = body.removePhotos.split(',').filter(Boolean);
    profile.photos = profile.photos.filter((p) => !removeIds.includes(String(p._id)) && !removeIds.includes(p.publicId));
    if (!profile.photos.find((p) => p.isPrimary) && profile.photos.length) profile.photos[0].isPrimary = true;
    if (!profile.photos.length) profile.profilePhoto = '';
    else if (!profile.profilePhoto) profile.profilePhoto = profile.photos[0].url;
  }

  if (body.primaryPhoto) {
    profile.photos.forEach((p) => (p.isPrimary = String(p._id) === body.primaryPhoto));
    const primary = profile.photos.find((p) => p.isPrimary);
    if (primary) profile.profilePhoto = primary.url;
  }

  if (body.status) {
    profile.status = body.status;
    if (['published', 'featured'].includes(body.status)) profile.publishedAt = profile.publishedAt || new Date();
  }
  if (body.isFeatured !== undefined) {
    profile.isFeatured = body.isFeatured === 'true' || body.isFeatured === true;
    if (profile.isFeatured) profile.status = 'featured';
  }

  if (body.dateOfBirth && !body.age) {
    profile.age = Math.floor((Date.now() - new Date(body.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  await profile.save();
  await logActivity(req, 'profile_update', 'profiles', `Updated profile ${profile.profileId}`, 'MatrimonialProfile', profile._id);
  res.json({ success: true, data: profile });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findByIdAndDelete(req.params.id);
  if (!profile) throw AppError('Profile not found', 404);

  profile.photos.forEach((p) => {
    if (p.publicId) {
      const filePath = `${uploadDir}/${p.publicId || require('path').basename(p.url)}`;
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  });

  await Promise.all([
    require('../../models/Enquiry').deleteMany({ profile: profile._id }),
    require('../../models/SavedProfile').deleteMany({ profile: profile._id }),
  ]);

  await logActivity(req, 'profile_delete', 'profiles', `Deleted profile ${profile.profileId}`, 'MatrimonialProfile', profile._id);
  res.json({ success: true, message: 'Profile deleted' });
}));

router.put('/:id/publish', asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findById(req.params.id);
  if (!profile) throw AppError('Profile not found', 404);

  profile.status = profile.status === 'published' ? 'hidden' : 'published';
  if (profile.status === 'published') profile.publishedAt = profile.publishedAt || new Date();
  await profile.save();

  if (profile.status === 'published') {
    await Notification.create({
      user: null,
      type: 'profile_new',
      title: 'New Profile',
      message: `New profile ${profile.profileId} is now published.`,
      link: `/browse/profile/${profile._id}`,
    });
  }

  await logActivity(req, 'profile_publish', 'profiles', `${profile.status === 'published' ? 'Published' : 'Unpublished'} profile ${profile.profileId}`, 'MatrimonialProfile', profile._id);
  res.json({ success: true, data: profile });
}));

router.put('/:id/feature', asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findById(req.params.id);
  if (!profile) throw AppError('Profile not found', 404);

  profile.isFeatured = !profile.isFeatured;
  if (profile.isFeatured && !['published', 'featured'].includes(profile.status)) profile.status = 'published';
  if (profile.isFeatured) profile.status = 'featured';
  else if (profile.status === 'featured') profile.status = 'published';
  await profile.save();

  await logActivity(req, 'profile_feature', 'profiles', `${profile.isFeatured ? 'Featured' : 'Unfeatured'} profile ${profile.profileId}`, 'MatrimonialProfile', profile._id);
  res.json({ success: true, data: profile });
}));

router.put('/:id/block', asyncHandler(async (req, res) => {
  const profile = await MatrimonialProfile.findById(req.params.id);
  if (!profile) throw AppError('Profile not found', 404);
  profile.status = 'blocked';
  await profile.save();
  await logActivity(req, 'profile_block', 'profiles', `Blocked profile ${profile.profileId}`, 'MatrimonialProfile', profile._id);
  res.json({ success: true, data: profile });
}));

router.get('/months', asyncHandler(async (_req, res) => {
  const data = await MatrimonialProfile.aggregate([
    { $match: { createdAt: { $gte: new Date(new Date().getTime() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data });
}));

module.exports = router;
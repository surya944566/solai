const express = require('express');
const { body, validationResult } = require('express-validator');
const Enquiry = require('../models/Enquiry');
const MatrimonialProfile = require('../models/MatrimonialProfile');
const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../utils/helpers');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('profile').notEmpty().withMessage('Profile is required'),
    body('message').optional().isLength({ max: 2000 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const profile = await MatrimonialProfile.findOne({
      _id: req.body.profile,
      status: { $in: ['published', 'featured'] },
    });
    if (!profile) throw AppError('Profile not found', 404);

    const existing = await Enquiry.findOne({ user: req.user._id, profile: profile._id, status: { $in: ['pending', 'contacted', 'in_progress'] } });
    if (existing) throw AppError('You already have an active enquiry for this profile', 409);

    const enquiry = await Enquiry.create({
      user: req.user._id,
      profile: profile._id,
      message: req.body.message,
      history: [{ status: 'pending', note: 'Enquiry created' }],
    });

    res.status(201).json({ success: true, data: enquiry });
  })
);

router.get('/my', asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.find({ user: req.user._id })
    .select('-internalNotes')
    .sort({ createdAt: -1 })
    .populate('profile', 'profileId name gender age location education occupation maritalStatus profilePhoto status')
    .lean();
  res.json({ success: true, data: enquiries });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findOne({ _id: req.params.id, user: req.user._id })
    .select('-internalNotes')
    .populate('profile', 'profileId name gender age location education occupation maritalStatus profilePhoto status')
    .lean();
  if (!enquiry) throw AppError('Enquiry not found', 404);
  res.json({ success: true, data: enquiry });
}));

router.put('/:id/cancel', asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findOne({ _id: req.params.id, user: req.user._id });
  if (!enquiry) throw AppError('Enquiry not found', 404);
  if (!['pending', 'contacted', 'in_progress'].includes(enquiry.status)) {
    throw AppError('This enquiry can no longer be cancelled', 400);
  }
  enquiry.status = 'cancelled';
  enquiry.history.push({ status: 'cancelled', note: 'Cancelled by user' });
  await enquiry.save();
  res.json({ success: true, data: enquiry });
}));

module.exports = router;
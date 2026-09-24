const express = require('express');
const SiteSetting = require('../../models/SiteSetting');
const ActivityLog = require('../../models/ActivityLog');
const { asyncHandler, AppError } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');

const router = express.Router();

const DEFAULT_SETTINGS = {
  general: {
    site_name: 'Solai Matrimony',
    tagline: 'Find Your Perfect Life Partner',
    logo_url: '',
    footer_text: 'Solai Matrimony is committed to helping you find the perfect life partner with trust and care.',
  },
  hero: {
    hero_title: 'Find Your Perfect Life Partner',
    hero_subtitle: 'Discover meaningful connections with trusted matrimonial profiles.',
    hero_primary_button: 'Browse Profiles',
    hero_secondary_button: 'Get Started',
  },
  about: {
    about_text: 'Solai Matrimony is a trusted matrimonial service dedicated to bringing families together with care, respect and security.',
  },
  contact: {
    office_name: 'Solai Matrimony Office',
    office_phone: '+91 00000 00000',
    office_email: 'contact@solaimatrimony.com',
    office_address: '123, Marriage Street, Chennai, Tamil Nadu',
    map_url: '',
  },
  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  },
  stats: {
    trusted_profiles: 2500,
    active_members: 1200,
    successful_connections: 950,
    years_of_service: 15,
  },
  content: {
    why_choose_us_title: 'Why Choose Solai Matrimony',
    how_it_works_title: 'How It Works',
    testimonials_title: 'What Our Families Say',
    faq_title: 'Frequently Asked Questions',
    privacy_policy:
      'Your privacy is important to us. We never share your personal information without your consent.',
    terms_conditions:
      'By using Solai Matrimony you agree to our terms and the responsible use of our services.',
  },
};

async function getSettingMap() {
  const rows = await SiteSetting.find().lean();
  const map = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return map;
}

async function seedDefaultsIfMissing() {
  const existing = await SiteSetting.countDocuments();
  if (existing === 0) {
    const docs = [];
    Object.entries(DEFAULT_SETTINGS).forEach(([group, values]) => {
      Object.entries(values).forEach(([key, value]) => {
        docs.push({ key, group, label: key.split('_').join(' '), value });
      });
    });
    await SiteSetting.insertMany(docs);
  }
}

async function upsert(key, value, group = 'general', label = '') {
  await SiteSetting.findOneAndUpdate(
    { key },
    { value, group, label: label || key.split('_').join(' ') },
    { upsert: true, new: true }
  );
}

router.get('/public', asyncHandler(async (_req, res) => {
  await seedDefaultsIfMissing();
  res.json({ success: true, data: await getSettingMap() });
}));

router.get('/', protectAdmin, asyncHandler(async (_req, res) => {
  await seedDefaultsIfMissing();
  res.json({ success: true, data: await getSettingMap() });
}));

router.put('/', protectAdmin, asyncHandler(async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') throw AppError('Invalid settings payload', 400);

  for (const [rawKey, value] of Object.entries(updates)) {
    const cleanKey = rawKey.includes('.') ? rawKey.split('.').slice(1).join('.') : rawKey;
    const group = rawKey.includes('.') ? rawKey.split('.')[0] : 'general';
    await upsert(cleanKey, value, group);
  }

  await ActivityLog.create({
    admin: req.admin._id,
    action: 'settings_update',
    module: 'settings',
    description: 'Updated site settings',
    ip: req.ip,
  }).catch(() => {});

  res.json({ success: true, data: await getSettingMap() });
}));

module.exports = { router, getSettingMap, seedDefaultsIfMissing, upsert, DEFAULT_SETTINGS };
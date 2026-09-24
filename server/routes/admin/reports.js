const express = require('express');
const User = require('../../models/User');
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const Enquiry = require('../../models/Enquiry');
const ActivityLog = require('../../models/ActivityLog');
const SupportConversation = require('../../models/SupportConversation');
const SupportMessage = require('../../models/SupportMessage');
const SavedProfile = require('../../models/SavedProfile');
const { asyncHandler } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(protectAdmin);

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== 'object');
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(',')];
  rows.forEach((r) => lines.push(headers.map((h) => esc(r[h])).join(',')));
  return lines.join('\n');
}

function sendCsv(res, rows, name) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
  res.send(toCsv(rows));
}

const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await User.find().select('name email mobile status createdAt lastLoginAt isAdminCreated').lean();
  sendCsv(res, users.map((u) => ({ id: u._id, name: u.name, email: u.email || '', mobile: u.mobile || '', status: u.status, created: u.createdAt, lastLogin: u.lastLoginAt || '' })), 'users-report');
}));

router.get('/profiles', asyncHandler(async (_req, res) => {
  const profiles = await MatrimonialProfile.find().select('profileId name gender age maritalStatus education occupation location district state status isFeatured views createdAt').lean();
  sendCsv(res, profiles.map((p) => ({ profileId: p.profileId, name: p.name, gender: p.gender, age: p.age ?? '', maritalStatus: p.maritalStatus, education: p.education || '', occupation: p.occupation || '', location: p.location || '', district: p.district || '', state: p.state || '', status: p.status, isFeatured: p.isFeatured, views: p.views, created: p.createdAt })), 'profiles-report');
}));

router.get('/enquiries', asyncHandler(async (_req, res) => {
  const enquiries = await Enquiry.find({ createdAt: { $gte: last30 } })
    .populate('user', 'name email mobile')
    .populate('profile', 'profileId name')
    .lean();
  sendCsv(res, enquiries.map((e) => ({ id: e._id, user: e.user?.name, email: e.user?.email, profile: e.profile?.profileId, profileName: e.profile?.name, status: e.status, created: e.createdAt })), 'enquiries-report');
}));

router.get('/support', asyncHandler(async (_req, res) => {
  const convos = await SupportConversation.find({ createdAt: { $gte: last30 } }).populate('user', 'name email mobile').lean();
  sendCsv(res, convos.map((c) => ({ id: c._id, user: c.user?.name, email: c.user?.email, status: c.status, lastMessage: c.lastMessagePreview || '', lastMessageAt: c.lastMessageAt || '', created: c.createdAt })), 'support-report');
}));

router.get('/most-viewed', asyncHandler(async (_req, res) => {
  const profiles = await MatrimonialProfile.find().sort({ views: -1 }).limit(20).select('profileId name gender maritalStatus views').lean();
  sendCsv(res, profiles.map((p) => ({ profileId: p.profileId, name: p.name, gender: p.gender, maritalStatus: p.maritalStatus, views: p.views })), 'most-viewed-profiles');
}));

router.get('/most-saved', asyncHandler(async (_req, res) => {
  const rows = await SavedProfile.aggregate([
    { $group: { _id: '$profile', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
  const profiles = await MatrimonialProfile.find({ _id: { $in: rows.map((r) => r._id) } }).select('profileId name gender maritalStatus').lean();
  const map = {};
  profiles.forEach((p) => (map[p._id] = p));
  sendCsv(res, rows.map((r) => ({ profileId: map[r._id]?.profileId, name: map[r._id]?.name, saves: r.count })), 'most-saved-profiles');
}));

router.get('/activity', asyncHandler(async (_req, res) => {
  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(1000)
    .populate('admin', 'name email')
    .lean();
  sendCsv(res, logs.map((l) => ({ id: l._id, admin: l.admin?.name || 'System', action: l.action, module: l.module, description: l.description, created: l.createdAt })), 'activity-report');
}));

router.get('/messages', asyncHandler(async (_req, res) => {
  const messages = await SupportMessage.find({ createdAt: { $gte: last30 } })
    .populate({ path: 'conversation', populate: { path: 'user', select: 'name email' } })
    .lean();
  sendCsv(res, messages.map((m) => ({ id: m._id, user: m.conversation?.user?.name, sender: m.sender, body: m.body, created: m.createdAt })), 'support-messages');
}));

module.exports = router;
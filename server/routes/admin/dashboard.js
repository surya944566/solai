const express = require('express');
const User = require('../../models/User');
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const Enquiry = require('../../models/Enquiry');
const SupportMessage = require('../../models/SupportMessage');
const SupportConversation = require('../../models/SupportConversation');
const { asyncHandler } = require('../../utils/helpers');
const { protectAdmin } = require('../../middleware/auth');

const router = express.Router();

router.use(protectAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const today = new Date();
  const last30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    pendingUsers,
    totalMale,
    totalFemale,
    marriedProfiles,
    featuredProfiles,
    draftProfiles,
    pendingEnquiries,
    unreadSupportMessages,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'blocked' }),
    User.countDocuments({ status: 'pending' }),
    MatrimonialProfile.countDocuments({ gender: 'male', status: { $ne: 'archived' } }),
    MatrimonialProfile.countDocuments({ gender: 'female', status: { $ne: 'archived' } }),
    MatrimonialProfile.countDocuments({ maritalStatus: 'married', status: { $ne: 'archived' } }),
    MatrimonialProfile.countDocuments({ isFeatured: true, status: { $in: ['published', 'featured'] } }),
    MatrimonialProfile.countDocuments({ status: 'draft' }),
    Enquiry.countDocuments({ status: { $in: ['pending', 'contacted', 'in_progress'] } }),
    SupportConversation.aggregate([{ $group: { _id: null, total: { $sum: '$unreadForAdmin' } } }]),
  ]);

  const monthlyRegistrations = await User.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const genderDistribution = await MatrimonialProfile.aggregate([
    { $match: { status: { $ne: 'archived' } } },
    { $group: { _id: '$gender', count: { $sum: 1 } } },
  ]);

  const statusDistribution = await User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  const categoryDistribution = await MatrimonialProfile.aggregate([
    { $match: { status: { $ne: 'archived' } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const enquiryStats = await Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  const [recentUsers, recentProfiles, recentEnquiries, recentConversations] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    MatrimonialProfile.find().sort({ createdAt: -1 }).limit(5).lean(),
    Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email mobile')
      .populate('profile', 'profileId name')
      .lean(),
    SupportConversation.find().sort({ lastMessageAt: -1 }).limit(5).populate('user', 'name email mobile').lean(),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        pendingUsers,
        totalMale,
        totalFemale,
        marriedProfiles,
        featuredProfiles,
        draftProfiles,
        pendingEnquiries,
        unreadSupportMessages: unreadSupportMessages[0]?.total || 0,
      },
      charts: {
        monthlyRegistrations,
        genderDistribution,
        statusDistribution,
        categoryDistribution,
        enquiryStats,
      },
      recent: {
        users: recentUsers,
        profiles: recentProfiles,
        enquiries: recentEnquiries,
        conversations: recentConversations,
      },
    },
  });
}));

module.exports = router;
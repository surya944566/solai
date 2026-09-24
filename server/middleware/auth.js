const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const { AppError, asyncHandler } = require('../utils/helpers');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) throw AppError('Not authorized, no token', 401);

  const decoded = require('../utils/helpers').verifyToken(token);
  if (decoded.type !== 'user') throw AppError('Not authorized', 401);

  const user = await User.findById(decoded.id);
  if (!user) throw AppError('User not found', 401);
  if (user.status !== 'active') throw AppError('Your account is blocked. Contact support.', 403);

  req.user = user;
  next();
});

const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) throw AppError('Not authorized, no token', 401);

  const decoded = require('../utils/helpers').verifyToken(token);
  if (decoded.type !== 'admin') throw AppError('Not authorized', 401);

  const admin = await AdminUser.findById(decoded.id);
  if (!admin) throw AppError('Admin not found', 401);
  if (admin.status !== 'active') throw AppError('Admin account blocked', 403);

  req.admin = admin;
  next();
});

const optionalAuth = async (req, _res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return next();
    const decoded = require('../utils/helpers').verifyToken(token);
    if (decoded.type !== 'user') return next();
    const user = await User.findById(decoded.id);
    if (user && user.status === 'active') req.user = user;
  } catch {
    // invalid/expired token — treat as anonymous
  }
  next();
};

module.exports = { protect, protectAdmin, optionalAuth };
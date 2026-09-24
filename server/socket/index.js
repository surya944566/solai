const { verifyToken } = require('../utils/helpers');
const mongoose = require('mongoose');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifyToken(token);
      if (decoded.type === 'user') {
        const user = await User.findById(decoded.id);
        if (!user || user.status !== 'active') return next(new Error('User is not active'));
        socket.user = user;
        socket.kind = 'user';
      } else if (decoded.type === 'admin') {
        const admin = await AdminUser.findById(decoded.id);
        if (!admin || admin.status !== 'active') return next(new Error('Admin is not active'));
        socket.admin = admin;
        socket.kind = 'admin';
      } else {
        return next(new Error('Invalid token'));
      }
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.kind === 'user') {
      socket.join(`user:${socket.user._id}`);
      console.log(`User ${socket.user.email || socket.user.mobile} connected`);
    } else if (socket.kind === 'admin') {
      socket.join('admins');
      console.log(`Admin ${socket.admin.email} connected`);
    }

    socket.on('typing', (data) => {
      if (socket.kind === 'user') {
        socket.to('admins').emit('typing', { userId: socket.user._id, typing: true });
      } else if (socket.kind === 'admin' && data && mongoose.isValidObjectId(data.userId)) {
        socket.to(`user:${data.userId}`).emit('typing', { adminId: socket.admin._id, typing: true });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

module.exports = { setupSocket };
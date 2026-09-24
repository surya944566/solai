const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, adminJwtExpiresIn } = require('../config/env');

function signUserToken(user, remember = false) {
  return jwt.sign({ id: user._id, type: 'user' }, jwtSecret, {
    expiresIn: remember === true ? '30d' : jwtExpiresIn,
  });
}

function signAdminToken(admin) {
  return jwt.sign({ id: admin._id, type: 'admin' }, jwtSecret, { expiresIn: adminJwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function AppError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { signUserToken, signAdminToken, verifyToken, asyncHandler, AppError };
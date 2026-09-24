const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const AdminUser = require('../../models/AdminUser');
const { signAdminToken, asyncHandler, AppError } = require('../../utils/helpers');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw AppError('Invalid email or password', 401);
    }
    if (admin.status !== 'active') throw AppError('This admin account is blocked', 403);

    admin.lastLoginAt = new Date();
    admin.lastLoginIp = req.ip;
    await admin.save();

    res.json({ success: true, token: signAdminToken(admin), admin });
  })
);

module.exports = router;
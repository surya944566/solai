const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator(v) {
          return v ? /^\S+@\S+\.\S+$/.test(v) : true;
        },
        message: 'Please enter a valid email',
      },
    },
    mobile: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    status: {
      type: String,
      enum: ['active', 'blocked', 'pending', 'inactive'],
      default: 'active',
    },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    loginHistory: [
      {
        at: { type: Date, default: Date.now },
        ip: { type: String },
        userAgent: { type: String },
      },
    ],
    isAdminCreated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
userSchema.index({ mobile: 1 });
userSchema.index({ status: 1 });

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
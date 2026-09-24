const mongoose = require('mongoose');

const profilePhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    isPrimary: { type: Boolean, default: false },
    caption: { type: String },
  },
  { timestamps: true }
);

const matrimonialProfileSchema = new mongoose.Schema(
  {
    profileId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dateOfBirth: { type: Date },
    age: { type: Number, min: 18, max: 100 },
    profilePhoto: { type: String, default: '' },
    photos: [profilePhotoSchema],
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      default: 'single',
    },
    height: { type: String },
    education: { type: String },
    occupation: { type: String },
    salary: { type: String },
    location: { type: String },
    district: { type: String },
    state: { type: String },
    religion: { type: String },
    community: { type: String },
    familyDetails: { type: String },
    about: { type: String },
    partnerExpectations: { type: String },
    contactVisibility: {
      type: String,
      enum: ['private', 'public', 'admin_only'],
      default: 'private',
    },
    phone: { type: String },
    email: { type: String },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'featured', 'hidden', 'blocked', 'archived'],
      default: 'draft',
    },
    views: { type: Number, default: 0 },
    viewLogs: [
      {
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    reportCount: { type: Number, default: 0 },
    reports: [
      {
        reason: { type: String },
        note: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

matrimonialProfileSchema.index({ gender: 1, status: 1 });
matrimonialProfileSchema.index({ state: 1, district: 1 });
matrimonialProfileSchema.index({ maritalStatus: 1 });
matrimonialProfileSchema.index({ isFeatured: 1 });
matrimonialProfileSchema.index(
  { name: 'text', location: 'text', education: 'text', occupation: 'text', about: 'text' },
  { default_language: 'english' }
);

matrimonialProfileSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('MatrimonialProfile', matrimonialProfileSchema);
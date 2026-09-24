const mongoose = require('mongoose');

const savedProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'MatrimonialProfile', required: true },
  },
  { timestamps: true }
);

savedProfileSchema.index({ user: 1, profile: 1 }, { unique: true });

savedProfileSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SavedProfile', savedProfileSchema);
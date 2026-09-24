const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    action: { type: String, required: true },
    module: { type: String },
    targetType: { type: String },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ admin: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
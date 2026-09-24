const mongoose = require('mongoose');

const supportConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['open', 'closed', 'blocked'],
      default: 'open',
    },
    subject: { type: String, trim: true, maxlength: 200 },
    closedAt: { type: Date },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    internalNotes: { type: String },
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
    unreadForUser: { type: Number, default: 0 },
    unreadForAdmin: { type: Number, default: 0 },
  },
  { timestamps: true }
);

supportConversationSchema.index({ user: 1, status: 1 });
supportConversationSchema.index({ lastMessageAt: -1 });

supportConversationSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SupportConversation', supportConversationSchema);
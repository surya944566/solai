const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportConversation',
      required: true,
      index: true,
    },
    sender: { type: String, enum: ['user', 'admin'], required: true },
    senderName: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    attachment: { type: String },
    readByUser: { type: Boolean, default: false },
    readByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

supportMessageSchema.index({ conversation: 1, createdAt: 1 });

supportMessageSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
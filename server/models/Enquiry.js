const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'MatrimonialProfile', required: true },
    message: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'in_progress', 'approved', 'rejected', 'completed', 'closed', 'cancelled'],
      default: 'pending',
    },
    adminReply: { type: String },
    repliedAt: { type: Date },
    internalNotes: { type: String },
    history: [
      {
        status: { type: String },
        note: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

enquirySchema.index({ user: 1, status: 1 });
enquirySchema.index({ profile: 1 });
enquirySchema.index({ createdAt: -1 });

enquirySchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Enquiry', enquirySchema);
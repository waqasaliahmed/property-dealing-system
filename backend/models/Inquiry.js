const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    inquiryType: {
      type: String,
      enum: ['general', 'viewing', 'purchase', 'rent'],
      default: 'general',
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      minlength: 10,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['new', 'viewed', 'responded', 'closed'],
      default: 'new',
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for filtering inquiries
inquirySchema.index({ propertyId: 1, status: 1 });
inquirySchema.index({ userId: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);

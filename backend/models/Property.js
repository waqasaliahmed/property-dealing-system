const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide property title'],
      enum: ['Plot', 'House', 'Land', 'Apartment', 'Commercial'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
    },
    ownerEmail: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    ownerPhone: {
      type: String,
      required: true,
    },
    area: {
      value: {
        type: Number,
        required: [true, 'Please provide area value'],
      },
      unit: {
        type: String,
        enum: ['Marla', 'Kanal', 'Acre', 'Square Feet', 'Square Meters'],
        required: true,
      },
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please provide city'],
      },
      area: {
        type: String,
        required: [true, 'Please provide area/neighborhood'],
      },
      address: {
        type: String,
        required: [true, 'Please provide complete address'],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    description: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['available', 'dealing', 'sold'],
      default: 'available',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    ownershipHistory: [
      {
        ownerName: String,
        ownerEmail: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    documents: [
      {
        name: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    saleRequest: {
      requested: { type: Boolean, default: false },
      requestedAt: { type: Date, default: null },
      buyerName: { type: String, default: '' },
      buyerPhone: { type: String, default: '' },
      salePrice: { type: Number, default: null },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial', 'land', 'industrial'],
      required: [true, 'Please specify property type'],
      index: true,
    },
    subType: {
      type: String,
      enum: ['plot', 'house', 'apartment', 'villa', 'office', 'shop', 'warehouse'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      minlength: 10,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      minlength: 20,
      maxlength: 2000,
    },
    location: {
      city: {
        type: String,
        required: true,
        index: true,
      },
      area: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      zipCode: String,
    },
    area: {
      value: {
        type: Number,
        required: [true, 'Please provide area value'],
      },
      unit: {
        type: String,
        enum: ['marla', 'kanal', 'acre', 'sqft', 'sqm'],
        required: true,
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      index: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    features: {
      parking: Boolean,
      garden: Boolean,
      balcony: Boolean,
      kitchen: Boolean,
      washingMachine: Boolean,
      airConditioning: Boolean,
      heater: Boolean,
    },
    amenities: [String],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    documents: [
      {
        name: String,
        fileUrl: String,
        type: {
          type: String,
          enum: ['deed', 'mutation', 'tax', 'electricity', 'water', 'other'],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'sold', 'rented', 'expired', 'deleted'],
      default: 'active',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: Date,
    verificationStatus: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      verifiedBy: mongoose.Schema.Types.ObjectId,
      verificationNote: String,
      verifiedAt: Date,
    },
    contact: {
      ownerName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
      },
      phone: {
        type: String,
        required: true,
      },
      whatsapp: String,
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
    expiresAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 60); // Listing expires in 60 days
        return date;
      },
    },
  },
  { timestamps: true }
);

// Indexes for common queries
listingSchema.index({ userId: 1, status: 1 });
listingSchema.index({ 'location.city': 1, status: 1 });
listingSchema.index({ propertyType: 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ 'verificationStatus.status': 1 });

// Pre-save middleware to calculate pricePerUnit
listingSchema.pre('save', function (next) {
  this.pricePerUnit = this.price / this.area.value;
  next();
});

module.exports = mongoose.model('Listing', listingSchema);

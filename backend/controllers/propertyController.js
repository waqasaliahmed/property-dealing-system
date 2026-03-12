const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// Create Property (Admin & User)
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      ownerName,
      ownerEmail,
      ownerPhone,
      area,
      location,
      price,
      description,
      amenities,
    } = req.body;

    // Validation
    if (!title || !ownerName || !ownerPhone || !area || !location || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    // Parse area if it's a string
    let areaData = area;
    if (typeof area === 'string') {
      areaData = JSON.parse(area);
    }

    // Parse location if it's a string
    let locationData = location;
    if (typeof location === 'string') {
      locationData = JSON.parse(location);
    }

    // Handle multiple image uploads
    const images = [];
    if (req.files && req.files.images) {
      req.files.images.forEach((file) => {
        images.push({ url: `/uploads/${file.filename}` });
      });
    } else if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        images.push({ url: `/uploads/${file.filename}` });
      });
    }

    // Handle document uploads
    const documents = [];
    if (req.files && req.files.documents) {
      req.files.documents.forEach((file) => {
        documents.push({
          name: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
        });
      });
    }

    // Check documents are required
    if (documents.length === 0 && (!req.files || !req.files.documents)) {
      // Allow creation without documents for backward compatibility but flag it
    }

    // Create property - admin properties auto-verified
    const property = await Property.create({
      title,
      ownerName,
      ownerEmail,
      ownerPhone,
      area: areaData,
      location: locationData,
      price,
      description,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
      documents,
      createdBy: req.userId,
      verificationStatus: req.userRole === 'admin' ? 'verified' : 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully!',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message,
    });
  }
};

// Get All Properties (public sees verified only, admin sees all with ?all=true)
exports.getAllProperties = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, area, areaUnit, type, status, all, search } = req.query;

    // Build filter
    let filter = {};

    // If not admin requesting all, only show verified
    if (all !== 'true') {
      filter.verificationStatus = 'verified';
    }

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      const locationFilter = { $regex: location, $options: 'i' };
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: [{ 'location.city': locationFilter }, { 'location.area': locationFilter }] }
        ];
        delete filter.$or;
      } else {
        filter.$or = [{ 'location.city': locationFilter }, { 'location.area': locationFilter }];
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (area) {
      filter['area.value'] = { $gte: parseFloat(area) };
    }

    if (areaUnit) {
      filter['area.unit'] = areaUnit;
    }

    if (type) {
      filter.title = type;
    }

    if (status) {
      filter.status = status;
    }

    const properties = await Property.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message,
    });
  }
};

// Get My Properties (for logged-in user)
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ createdBy: req.userId })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your properties',
      error: error.message,
    });
  }
};

// Get Single Property
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('createdBy', 'fullName email phoneNumber');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message,
    });
  }
};

// Update Property (Admin Only)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Only admin or property creator can update
    if (req.userRole !== 'admin' && property.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property.',
      });
    }

    // Update fields
    const { title, ownerName, ownerEmail, ownerPhone, area, location, price, description, amenities } = req.body;

    if (title) property.title = title;
    if (ownerName) property.ownerName = ownerName;
    if (ownerEmail) property.ownerEmail = ownerEmail;
    if (ownerPhone) property.ownerPhone = ownerPhone;
    if (area) property.area = typeof area === 'string' ? JSON.parse(area) : area;
    if (location) property.location = typeof location === 'string' ? JSON.parse(location) : location;
    if (price) property.price = price;
    if (description) property.description = description;
    if (amenities) property.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

    // Handle new images
    if (req.files && req.files.images) {
      req.files.images.forEach((file) => {
        property.images.push({ url: `/uploads/${file.filename}` });
      });
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        property.images.push({ url: `/uploads/${file.filename}` });
      });
    }

    // Handle new documents
    if (req.files && req.files.documents) {
      req.files.documents.forEach((file) => {
        property.documents.push({
          name: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
        });
      });
    }

    // If user edits, set back to pending verification
    if (req.userRole !== 'admin') {
      property.verificationStatus = 'pending';
    }

    property = await property.save();

    res.status(200).json({
      success: true,
      message: 'Property updated successfully!',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message,
    });
  }
};

// Delete Property (Admin Only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Only admin can delete
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete properties.',
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message,
    });
  }
};

// Verify Property (Admin Only)
exports.verifyProperty = async (req, res) => {
  try {
    const { status } = req.body; // pending, verified, rejected

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status.',
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Property ${status} successfully!`,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying property',
      error: error.message,
    });
  }
};

// Update Property Status (Admin or Owner - dealing/sold/available)
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['available', 'dealing', 'sold'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: available, dealing, or sold.',
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    // Allow admin or property owner to change status
    if (req.userRole !== 'admin' && property.createdBy.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this property status.',
      });
    }

    property.status = status;
    await property.save();

    res.status(200).json({
      success: true,
      message: `Property marked as ${status} successfully!`,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating property status',
      error: error.message,
    });
  }
};

// Contact Owner - auto set property to dealing (Visitor contacts owner)
exports.contactOwner = async (req, res) => {
  try {
    const { name, email, phone, message, inquiryType } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and message.',
      });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      propertyId: property._id,
      userId: req.userId,
      name,
      email,
      phone,
      message,
      inquiryType: inquiryType || 'general',
    });

    // Auto-set property to dealing if it's available
    if (property.status === 'available') {
      property.status = 'dealing';
      await property.save();
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent! Property status changed to dealing.',
      inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending inquiry',
      error: error.message,
    });
  }
};

// Request Sale Completion (Owner requests admin to mark as sold)
exports.requestSale = async (req, res) => {
  try {
    const { buyerName, buyerPhone, salePrice } = req.body;
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (property.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only the property owner can request sale.' });
    }

    property.saleRequest = {
      requested: true,
      requestedAt: new Date(),
      buyerName: buyerName || '',
      buyerPhone: buyerPhone || '',
      salePrice: salePrice || property.price,
    };
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Sale request sent to admin!',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting sale',
      error: error.message,
    });
  }
};

// Approve Sale Request (Admin marks property as sold)
exports.approveSale = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    property.status = 'sold';
    property.saleRequest.requested = false;
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Sale approved! Property marked as sold.',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving sale',
      error: error.message,
    });
  }
};

// Reject Sale Request (Admin rejects the sale request)
exports.rejectSale = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    property.saleRequest = {
      requested: false,
      requestedAt: null,
      buyerName: '',
      buyerPhone: '',
      salePrice: null,
    };
    await property.save();

    res.status(200).json({
      success: true,
      message: 'Sale request rejected.',
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting sale',
      error: error.message,
    });
  }
};

// Get inquiries for a property (Owner or Admin)
exports.getPropertyInquiries = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (req.userRole !== 'admin' && property.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const inquiries = await Inquiry.find({ propertyId: req.params.id })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, inquiries });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries',
      error: error.message,
    });
  }
};

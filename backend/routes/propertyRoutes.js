const express = require('express');
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  verifyProperty,
  updatePropertyStatus,
  getMyProperties,
  contactOwner,
  requestSale,
  approveSale,
  rejectSale,
  getPropertyInquiries,
} = require('../controllers/propertyController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const uploadMulter = require('../middleware/upload');
const { uploadMixed } = require('../middleware/upload');

const router = express.Router();

// Public Routes
router.get('/', getAllProperties);

// Protected Routes (must come before /:id)
router.get('/user/my-properties', authMiddleware, getMyProperties);

// Public single property
router.get('/:id', getPropertyById);

// Protected Routes (Authenticated users - both admin & user can add)
router.post('/', authMiddleware, uploadMixed.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
]), createProperty);

// Protected Routes (Owner or Admin can update)
router.put('/:id', authMiddleware, uploadMixed.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 },
]), updateProperty);

// Contact owner (auto-dealing) - authenticated users
router.post('/:id/contact', authMiddleware, contactOwner);

// Get inquiries for a property
router.get('/:id/inquiries', authMiddleware, getPropertyInquiries);

// Owner requests sale completion
router.post('/:id/request-sale', authMiddleware, requestSale);

// Admin approves sale
router.patch('/:id/approve-sale', authMiddleware, adminMiddleware, approveSale);

// Admin rejects sale request
router.patch('/:id/reject-sale', authMiddleware, adminMiddleware, rejectSale);

// Status change (owner or admin)
router.patch('/:id/status', authMiddleware, updatePropertyStatus);

// Admin only routes
router.delete('/:id', authMiddleware, adminMiddleware, deleteProperty);
router.patch('/:id/verify', authMiddleware, adminMiddleware, verifyProperty);

module.exports = router;

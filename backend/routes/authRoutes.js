const express = require('express');
const { registerUser, loginUser, getCurrentUser, uploadProfilePicture, seedAdmin } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();

// Seed Admin Account (one-time setup)
router.post('/seed-admin', seedAdmin);

// Register Route
router.post('/register', registerUser);

// Login Route
router.post('/login', loginUser);

// Get Current User (Protected Route)
router.get('/me', authMiddleware, getCurrentUser);

// Upload Profile Picture (Protected Route)
router.post('/upload-profile', authMiddleware, uploadMiddleware.single('profilePicture'), uploadProfilePicture);

module.exports = router;

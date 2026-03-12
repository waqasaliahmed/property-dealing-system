const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: '7d',
  });
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, address, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, and password.',
      });
    }

    // Prevent admin signup - admin accounts can only be created by system
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts can only be created by system administrators. Please contact support.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role: 'user', // Default role is user
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Validate role if provided (from login page)
    if (role && role !== user.role) {
      if (role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'This account is not an admin account. Please use User Login instead.',
        });
      } else {
        return res.status(403).json({
          success: false,
          message: 'This is an admin account. Please use Admin Login instead.',
        });
      }
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// Seed Admin Account (one-time setup)
exports.seedAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already exists. Login with admin credentials.',
      });
    }

    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@property.com',
      password: 'Admin@123',
      phoneNumber: '',
      address: '',
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created! Email: admin@property.com | Password: Admin@123',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin account',
      error: error.message,
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update user's profile picture
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    user.profilePicture = profilePictureUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully!',
      profilePictureUrl: profilePictureUrl,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message,
    });
  }
};

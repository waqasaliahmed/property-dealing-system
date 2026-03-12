  const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory');
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Connect MongoDB (non-blocking — server stays up even if DB is unavailable)
connectDB().then((connected) => {
  if (!connected) {
    console.log('⚠ Server running WITHOUT database — login/signup will not work until MongoDB is available.');
  }
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: '✓ Property Management Backend API',
    version: '1.0.0',
    status: 'Running',
    NODE_ENV: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      health: '/api/health'
    },
    frontend: 'http://localhost:3000'
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum 5MB allowed.'
    });
  }
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next(err);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.path} is not defined`,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      auth: 'POST /api/auth/login, POST /api/auth/register',
      properties: 'GET /api/properties, POST /api/properties (admin only)'
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
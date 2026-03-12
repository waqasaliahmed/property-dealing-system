const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login first.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admin users can access this resource.',
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };

const multer = require('multer');
const path = require('path');

// Set storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter files - images only
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false);
  }
};

// Filter files - images and documents (PDF, images)
const mixedFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, gif, webp) and PDF documents are allowed'), false);
  }
};

const uploadMulter = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const uploadMixed = multer({
  storage: storage,
  fileFilter: mixedFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

module.exports = uploadMulter;
module.exports.uploadMixed = uploadMixed;

# Property Management Backend

## Project Structure

```
backend/
├── models/
│   ├── User.js          # User schema (admin, user)
│   └── Property.js      # Property schema
├── controllers/
│   ├── authController.js
│   └── propertyController.js
├── routes/
│   ├── authRoutes.js
│   └── propertyRoutes.js
├── middleware/
│   ├── auth.js          # JWT authentication
│   └── upload.js        # File upload handler
├── config/
│   └── database.js
├── uploads/             # Uploaded images folder (created after first upload)
├── server.js
├── package.json
└── .env (create this from .env.example)
```

## Setup Instructions

### 1. Install Node.js
   - Download from https://nodejs.org/
   - Choose LTS version
   - Install and verify: `node --version` and `npm --version`

### 2. Install Dependencies
   - Navigate to backend folder
   - Run: `npm install`

### 3. Create .env file
   - Copy `.env.example` to `.env`
   - Update values:
     ```
     MONGODB_URI=mongodb://localhost:27017/property_management
     PORT=5000
     JWT_SECRET=your_super_secret_jwt_key_change_this
     CORS_ORIGIN=http://localhost:3000
     ```

### 4. Install and Run MongoDB
   - See MongoDB setup guide below

### 5. Start Backend Server
   - Development: `npm run dev` (requires nodemon)
   - Production: `npm start`
   - Server runs on http://localhost:5000

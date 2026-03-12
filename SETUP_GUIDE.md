# Property Management Application - Setup & Usage Guide

## ✅ What Has Been Setup & Fixed

### Backend Configuration
- ✓ MongoDB connection configured in `.env` file
- ✓ JWT authentication implemented with 7-day token expiration
- ✓ Uploads directory created and configured
- ✓ Express error handling for file uploads (max 5MB per image)
- ✓ Admin-only middleware for property management endpoints
- ✓ CORS configured for frontend (localhost:3000)

### Frontend Features
- ✓ Delete property button (visible in Admin Dashboard, admin-only)
- ✓ Add property form with validation and error handling
- ✓ JWT token stored in localStorage for authentication
- ✓ Admin role verification before showing admin features
- ✓ File size validation (max 5MB per image, up to 10 images)
- ✓ FormData properly configured for multipart file uploads

---

## 🚀 Prerequisites & Installation

### 1. MongoDB Setup

#### Option A: Local MongoDB Installation (Recommended for Development)

**Windows:**
1. Download MongoDB Community from: https://www.mongodb.com/try/download/community
2. Run the installer
3. During installation, ensure "Install MongoDB as a Service" is checked
4. MongoDB will run automatically on `mongodb://localhost:27017`

**Verify MongoDB is running:**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB
```

#### Option B: MongoDB Atlas (Cloud)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/property_management`
4. Update `.env` file with this connection string

### 2. Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (already done, but verify it exists)
# Check that .env contains:
# - MONGODB_URI=mongodb://localhost:27017/property_management
# - PORT=5000
# - JWT_SECRET=property_management_super_secret_jwt_key_change_in_production_2025
# - CORS_ORIGIN=http://localhost:3000

# Start backend server
npm start

# Expected output:
# ✓ MongoDB Connected Successfully
# 🚀 Server running on http://localhost:5000
```

### 3. Frontend Setup

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm start

# Application will open at http://localhost:3000
```

---

## 🔐 Authentication & Admin Setup

### Creating an Admin User

1. **Register as User:**
   - Go to http://localhost:3000/register
   - Fill in all fields
   - Click "Sign Up"
   - Note: First registration is a regular user role

2. **Upgrade to Admin (Development Only):**
   
   **Option A: Direct Database Update**
   ```javascript
   // Connect to MongoDB using MongoDB Compass or Mongo Shell
   use property_management
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

   **Option B: Modify Backend Code (Temporary)**
   - Edit `backend/controllers/authController.js` line ~38
   - Change `role: 'user'` to `role: 'admin'`
   - Register a new user (will be admin)
   - Revert the change in code
   - Re-register other users normally

3. **Login as Admin:**
   - Go to http://localhost:3000/login
   - Enter admin email and password
   - You'll be redirected to admin dashboard

---

## 📋 Admin Dashboard Features

### Add Property
1. Click "➕ Add Property" button
2. Fill in all required fields:
   - **Property Type:** Select from Plot, House, Land, Apartment, Commercial
   - **Owner Name:** Property owner's name
   - **Owner Phone:** Contact number (required)
   - **Owner Email:** Email address (optional but recommended)
   - **Area:** Value + Unit (Marla, Kanal, Acre, etc.)
   - **Location:** City, Area/Neighborhood, Complete Address
   - **Price:** In PKR
   - **Description:** Property details (optional)
   - **Amenities:** Comma-separated list (optional)
   - **Images:** Upload 1-10 images (JPG, PNG, GIF, WebP, max 5MB each)
3. Click "Create Property"
4. Property will be created with "pending" verification status

### Manage Properties

#### Verify Property
- Click property card
- Click "✓ Verify" to approve (mark as verified)
- Click "✗ Reject" to reject (mark as rejected)
- Verified properties appear to public users

#### Delete Property
- Click "Delete" button on property card
- Confirm deletion in modal
- Property is permanently removed from database

#### Search Properties
- Use search bar to find by owner name, city, area, or property type
- Filter by status: All Properties, Pending, Verified

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user (protected)
```

### Properties (Admin)
```
POST   /api/properties         - Create property (admin only, requires file upload)
PUT    /api/properties/:id     - Update property (admin only)
DELETE /api/properties/:id     - Delete property (admin only)
PATCH  /api/properties/:id/verify - Verify/Reject property (admin only)
```

### Properties (Public)
```
GET    /api/properties         - Get all verified properties
GET    /api/properties/:id     - Get single property detail
```

---

## 🐛 Troubleshooting

### "Connection Refused" Error
**Problem:** Backend won't start with MongoDB connection error
**Solution:**
1. Ensure MongoDB is running:
   ```powershell
   netstat -an | findstr :27017  # Should show LISTENING
   ```
2. If using MongoDB Atlas, verify connection string in `.env`
3. Check `.env` file exists in backend directory

### "No token provided" or "401 Unauthorized"
**Problem:** Getting authentication errors when trying to add property
**Solution:**
1. Ensure you're logged in (token in localStorage)
2. Log out and log back in
3. Check browser DevTools > Application > Storage > LocalStorage
4. Verify `token` and `userRole` are stored

### "Only admin can access this resource"
**Problem:** Not seeing admin buttons/features
**Solution:**
1. Your user account is not admin role
2. Follow "Creating an Admin User" section above
3. Clear localStorage and re-login

### Images Not Uploading
**Problem:** Error about file size or type
**Solution:**
1. Use images under 5MB (JPG, PNG, GIF, WebP)
2. Maximum 10 images per property
3. Check uploads directory exists: `backend/uploads/`
4. Check file permissions on uploads folder

### "Property not found" When Viewing
**Problem:** Created property but can't view it
**Solution:**
1. Admin created properties are in "pending" status
2. Must be verified first to appear in property list
3. Go to admin dashboard and click "✓ Verify"

---

## 📝 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  address: String,
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Property Model
```javascript
{
  _id: ObjectId,
  title: String (Plot/House/Land/Apartment/Commercial),
  ownerName: String,
  ownerEmail: String,
  ownerPhone: String,
  area: {
    value: Number,
    unit: String (Marla/Kanal/Acre/Square Feet/Square Meters)
  },
  location: {
    city: String,
    area: String,
    address: String,
    coordinates: { latitude: Number, longitude: Number }
  },
  price: Number,
  description: String,
  amenities: [String],
  images: [{
    url: String,
    uploadedAt: Date
  }],
  verificationStatus: String (pending/verified/rejected),
  createdBy: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Notes

1. **JWT Secret:** Change `JWT_SECRET` in `.env` for production
2. **CORS:** Currently allows only `http://localhost:3000`
3. **Admin Role:** Don't expose admin creation mechanism in production
4. **File Upload:** Validates file type and size on backend
5. **Password:** User passwords are hashed using bcrypt

---

## 📊 Testing Workflow

1. **Register User:**
   - http://localhost:3000/register
   - Email: admin@example.com
   - Password: Admin@123

2. **Upgrade to Admin:**
   - Modify backend code OR update MongoDB directly

3. **Login as Admin:**
   - http://localhost:3000/login
   - Use admin credentials

4. **Add Property:**
   - Click "➕ Add Property"
   - Fill all fields
   - Upload images
   - Click "Create Property"

5. **Verify Property:**
   - In admin dashboard, click property card
   - Click "✓ Verify"

6. **View as User:**
   - Logout and login as different user
   - Go to Property List (http://localhost:3000)
   - Should see verified properties

7. **Delete Property:**
   - In admin dashboard
   - Click "Delete" on any property
   - Confirm in modal

---

## 🎯 Key Features Implemented

✅ **JWT Authentication** - Secure user login with 7-day tokens
✅ **Role-Based Access** - Admin-only features with middleware protection
✅ **File Upload** - Image upload with validation (max 5MB, 10 images)
✅ **Delete Property** - Admin can delete any property from dashboard
✅ **Add Property** - Complete form with validation and error handling
✅ **Verification System** - Properties pending verification until admin approves
✅ **MongoDB Integration** - All data persisted in MongoDB
✅ **CORS Protection** - Frontend can only communicate from localhost:3000
✅ **Error Handling** - Comprehensive error messages for debugging

---

## 📞 Support & Next Steps

If you encounter issues:
1. Check MongoDB is running
2. Verify `.env` file configuration
3. Ensure both backend and frontend are running
4. Check browser console for JavaScript errors
5. Check backend terminal for error logs

For production deployment:
1. Change `JWT_SECRET` to a strong random string
2. Update `CORS_ORIGIN` to your domain
3. Use MongoDB Atlas instead of local MongoDB
4. Enable HTTPS
5. Set `NODE_ENV=production`

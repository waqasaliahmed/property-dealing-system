# ⚡ Quick Reference Guide

## 🚀 Start Servers (Run These Commands)

### Backend
```powershell
cd C:\Users\Super\OneDrive\Desktop\property\backend
npm start
```
**Expected Output:** `✓ MongoDB Connected Successfully` + `🚀 Server running on http://localhost:5000`

### Frontend  
```powershell
cd C:\Users\Super\OneDrive\Desktop\property\frontend
npm start
```
**Expected Output:** Frontend opens at `http://localhost:3000`

---

## 📝 Create Admin User (First Time Setup)

1. **Register:** Go to http://localhost:3000/register
   - Email: `admin@example.com`
   - Password: `Admin@123`
   - Name: `Admin User`

2. **Upgrade to Admin:** (Choose ONE method)

   **Method A: MongoDB Compass/Shell**
   ```javascript
   // Connect to: mongodb://localhost:27017/property_management
   use property_management
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

   **Method B: Temporary Code Change**
   - Edit: `backend/controllers/authController.js` (line ~38)
   - Change: `role: 'user'` → `role: 'admin'`
   - Register user (becomes admin)
   - Revert the change

3. **Login:** Go to http://localhost:3000/login
   - Use admin email & password
   - You'll see Admin Dashboard

---

## ✨ Main Features

### Add Property (Admin Only)
1. Click "➕ Add Property" button
2. Fill form fields:
   - **Title** - Property type (Plot/House/Land/Apartment/Commercial)
   - **Owner Name** - *Required
   - **Owner Phone** - *Required  
   - **Area** - Value + Unit (Marla/Kanal/Acre/etc) *Required
   - **Location** - City, Area, Address *Required
   - **Price** - In PKR *Required
   - **Images** - 1-10 images (JPG/PNG/GIF/WebP, max 5MB each)
3. Click "Create Property"
4. Property status: "pending" (needs verification)

### Verify Property
1. In Admin Dashboard, find property
2. Click "✓ Verify" to approve
3. Status changes to "verified"
4. Now visible to public users

### Delete Property
1. In Admin Dashboard
2. Click "Delete" button on property card
3. Confirm in popup
4. Property permanently removed

---

## 🔗 Application URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |
| Register | http://localhost:3000/register |
| Login | http://localhost:3000/login |
| Admin Dashboard | http://localhost:3000/admin/dashboard |
| Add Property | http://localhost:3000/admin/add-property |
| Property List | http://localhost:3000 |

---

## 📊 Database Info

**Connection String:** `mongodb://localhost:27017/property_management`

**Collections:**
- `users` - User accounts
- `properties` - Property listings

**File:** `backend/.env` - MySQL URI can be changed here

---

## 🔐 JWT Token Info

- **Token Location:** Browser localStorage (`token` key)
- **Expiration:** 7 days
- **Header:** `Authorization: Bearer {token}`
- **Auto-sent:** Yes (axios interceptor)

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Database & JWT config |
| `backend/server.js` | Express setup |
| `backend/config/database.js` | MongoDB connection |
| `backend/middleware/auth.js` | JWT verification |
| `backend/routes/propertyRoutes.js` | Property endpoints |
| `frontend/src/utils/api.js` | API calls |
| `frontend/src/pages/AddProperty.js` | Create property form |
| `frontend/src/pages/AdminDashboard.js` | Manage properties |
| `frontend/src/components/PropertyCard.js` | Property card (has delete button) |

---

## ✅ Troubleshooting

**Q: Backend won't start (MongoDB error)**
- A: Ensure MongoDB is running
- `netstat -an | findstr :27017` (should show LISTENING)
- Or use MongoDB Atlas connection string in `.env`

**Q: Can't add property (401 error)**
- A: Login first, ensure token is in localStorage
- Check DevTools > Application > Storage > LocalStorage

**Q: Delete button not showing**
- A: Must be logged in as admin
- Check `userRole` is "admin" in localStorage

**Q: Images not uploading**
- A: Check file size (max 5MB each)
- File type (JPG/PNG/GIF/WebP only)
- Maximum 10 images per property

**Q: Property not appearing in list**
- A: Property status must be "verified" (not "pending")
- Go to Admin Dashboard and click "✓ Verify"

---

## 🎯 User Roles

### Admin
- Add properties
- Delete properties
- Verify/Reject properties
- View all properties
- See admin dashboard
- Access: `/admin/dashboard`

### Regular User
- View verified properties
- Search properties
- View property details
- Access: `/` and `/property/:id`

### Guest (Not Logged In)
- View verified properties only
- Search properties
- View property details
- Cannot add/delete/verify

---

## 📊 API Quick Reference

```javascript
// Login
POST /api/auth/login
{ email, password }

// Create Property (Admin Only)
POST /api/properties
Headers: Authorization: Bearer {token}
FormData: { title, ownerName, ownerPhone, area, location, price, images[] }

// Delete Property (Admin Only)
DELETE /api/properties/:id
Headers: Authorization: Bearer {token}

// Verify Property (Admin Only)
PATCH /api/properties/:id/verify
Headers: Authorization: Bearer {token}
{ status: "verified" }

// Get All Properties
GET /api/properties?location=&minPrice=&maxPrice=

// Get Single Property
GET /api/properties/:id
```

---

## 🔒 Security Checklist

- ✅ Passwords are hashed (bcrypt)
- ✅ JWT tokens expire in 7 days
- ✅ Admin-only endpoints protected
- ✅ File uploads validated
- ✅ CORS enabled (frontend only)
- ⚠️ Change JWT_SECRET in `.env` for production

---

## 📞 Support

**Logs Location:**
- Backend: Console/Terminal output
- Frontend: Browser DevTools Console

**Check These First:**
1. Both servers running (ports 3000 & 5000)
2. MongoDB running
3. .env file exists in backend
4. Token in localStorage for auth

**For detailed help:** See SETUP_GUIDE.md

---

**Version:** 1.0.0 | **Date:** Feb 25, 2026 | **Status:** ✅ Working

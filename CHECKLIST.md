# ✅ PRE-LAUNCH CHECKLIST

Use this checklist to ensure everything is ready before running the application.

---

## 📋 PREREQUISITES (Software Installation)

- [ ] **Node.js installed** 
  - Check: `node --version` (should be v14+)
  - Check: `npm --version` (should be v6+)
  - Get it: https://nodejs.org

- [ ] **MongoDB installed or Atlas account**
  - **Local Installation**: MongoDb Community
    - Check: `mongod --version`
    - Service running: MongoDB as Windows Service
  - **Or MongoDB Atlas**:
    - Account created: https://www.mongodb.com/cloud/atlas
    - Cluster created
    - Connection string obtained

---

## 📁 PROJECT STRUCTURE

- [ ] **Backend folder exists**
  - Location: `backend/` directory
  - Contains: `server.js`, `package.json`, `models/`, `routes/`, etc.

- [ ] **Frontend folder exists**
  - Location: `frontend/` directory
  - Contains: `package.json`, `public/`, `src/`, etc.

- [ ] **Documentation files present**
  - [ ] README.md (main)
  - [ ] START_HERE.md
  - [ ] QUICK_START.md
  - [ ] COMPLETE_SETUP_GUIDE.md
  - [ ] ARCHITECTURE.md
  - [ ] PROJECT_INFO.md

---

## 🔧 BACKEND SETUP

- [ ] **Open PowerShell/Terminal**
  - `cd C:\Users\Super\OneDrive\Desktop\property\backend`

- [ ] **.env file created**
  - [ ] File named `.env` exists in `backend/` folder
  - [ ] Contains: MONGODB_URI
  - [ ] Contains: PORT=5000
  - [ ] Contains: JWT_SECRET (any value)
  - [ ] Contains: CORS_ORIGIN=http://localhost:3000

  Example .env content:
  ```
  MONGODB_URI=mongodb://localhost:27017/property_management
  PORT=5000
  JWT_SECRET=my_secret_key_123
  CORS_ORIGIN=http://localhost:3000
  NODE_ENV=development
  ```

- [ ] **Dependencies installed**
  - Command: `npm install`
  - Wait for completion
  - Folder `node_modules/` created

- [ ] **Backend structure verified**
  - [ ] `models/User.js` exists
  - [ ] `models/Property.js` exists
  - [ ] `controllers/authController.js` exists
  - [ ] `controllers/propertyController.js` exists
  - [ ] `routes/authRoutes.js` exists
  - [ ] `routes/propertyRoutes.js` exists
  - [ ] `middleware/auth.js` exists
  - [ ] `middleware/upload.js` exists

---

## ✨ FRONTEND SETUP

- [ ] **Open NEW PowerShell/Terminal**
  - `cd C:\Users\Super\OneDrive\Desktop\property\frontend`

- [ ] **Dependencies installed**
  - Command: `npm install`
  - Wait for completion
  - Folder `node_modules/` created

- [ ] **Frontend structure verified**
  - [ ] `public/index.html` exists
  - [ ] `src/App.js` exists
  - [ ] `src/App.css` exists
  - [ ] `src/pages/Login.js` exists
  - [ ] `src/pages/Register.js` exists
  - [ ] `src/pages/PropertyList.js` exists
  - [ ] `src/pages/PropertyDetail.js` exists
  - [ ] `src/pages/AdminDashboard.js` exists
  - [ ] `src/pages/AddProperty.js` exists
  - [ ] `src/components/Navbar.js` exists
  - [ ] `src/utils/api.js` exists

---

## 🚀 RUNNING THE APPLICATION

### Backend (Terminal 1)
- [ ] Navigate: `cd backend`
- [ ] Run: `npm run dev`
- [ ] **Wait for this message**:
  ```
  ✓ MongoDB Connected Successfully
  🚀 Server running on http://localhost:5000
  ```
- [ ] **Keep this terminal open!**

### Frontend (Terminal 2)
- [ ] Navigate: `cd frontend`
- [ ] Run: `npm start`
- [ ] **Wait for browser to open**
- [ ] Browser opens at `http://localhost:3000` automatically

---

## 🧪 TESTING THE APPLICATION

### Open Web Browser
- [ ] Go to: `http://localhost:3000`
- [ ] You should see the PropertyHub home page

### Test Registration
- [ ] Click "Register" 
- [ ] Fill in form:
  - [ ] Full Name: Test User
  - [ ] Email: test@example.com
  - [ ] Password: password123
  - [ ] Phone (optional): 03001234567
  - [ ] Address (optional): Test Address
- [ ] Click "Register" button
- [ ] Redirected to home page → ✅ Success!

### Test Login
- [ ] Click "Logout" button
- [ ] Click "Login" page link
- [ ] Enter: test@example.com / password123
- [ ] Click "Login" button
- [ ] Redirected to home page → ✅ Success!

### Create Admin Account
- [ ] Open MongoDB Compass: https://www.mongodb.com/products/compass
  - Or use VS Code MongoDB extension
- [ ] Connect to: `mongodb://localhost:27017`
- [ ] Database: `property_management`
- [ ] Collection: `users`
- [ ] Find your user document
- [ ] Edit: Change `"role": "user"` to `"role": "admin"`
- [ ] Save & close

### Test Admin Features
- [ ] Logout from user account
- [ ] Login with admin account
- [ ] Should see in navbar: "Dashboard" and "Add Property" links
- [ ] Click "Add Property"
- [ ] Fill form:
  - [ ] Title: Plot
  - [ ] Owner Name: Ahmed Khan
  - [ ] Owner Phone: 03001234567
  - [ ] Area: 5 Marla
  - [ ] City: Lahore
  - [ ] Area/Neighborhood: Defence
  - [ ] Address: Street 123
  - [ ] Price: 5000000
  - [ ] Optional: Description, amenities, images
- [ ] Click "Create Property"
- [ ] Should see success message → ✅ Success!

### Test Property Management
- [ ] Go to Admin Dashboard
- [ ] Should see property with status "pending"
- [ ] Click "✓ Verify" button
- [ ] Status changes to "verified"
- [ ] Logout, go to home page
- [ ] Should see property in listing → ✅ Success!

---

## 🔌 API TESTING (Optional)

### Test with Postman or Insomnia

#### Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@test.com",
  "password": "password123"
}
```

#### Login User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@test.com",
  "password": "password123"
}

Response includes: token (save this!)
```

#### Get All Properties
```
GET http://localhost:5000/api/properties
```

---

## 🆘 TROUBLESHOOTING CHECKLIST

### MongoDB Connection Error
- [ ] MongoDB service is running (Windows Services)
- [ ] .env has correct MONGODB_URI
- [ ] MongoDB is installed or Atlas account is set up
- [ ] Database name is "property_management"

### Port Already in Use
- [ ] Check what's using port 5000:
  ```powershell
  netstat -ano | findstr :5000
  ```
- [ ] Kill the process:
  ```powershell
  taskkill /F /PID <number>
  ```

### npm install fails
- [ ] Delete `node_modules` folder
- [ ] Delete `package-lock.json`
- [ ] Run `npm install` again

### Images not uploading
- [ ] Check `uploads/` folder exists in backend
- [ ] If not, create it: `mkdir backend/uploads`

### CORS Error
- [ ] Check .env has: `CORS_ORIGIN=http://localhost:3000`
- [ ] Backend and frontend must be on different ports

### Can't login
- [ ] Verify user exists in database
- [ ] Check password field is hashed
- [ ] Clear browser localStorage and try again

---

## 📊 SUCCESSFUL SETUP INDICATORS

You'll know everything works when:

- ✅ Terminal shows: "🚀 Server running on http://localhost:5000"
- ✅ Browser opens with React app at localhost:3000
- ✅ Can register new user without errors
- ✅ Can login successfully
- ✅ Can view properties on home page
- ✅ Can add property as admin
- ✅ Can verify property in admin dashboard
- ✅ Verified property appears on home page

---

## 📝 IMPORTANT NOTES

- **Keep both terminals open** while developing
  - Backend terminal: npm run dev
  - Frontend terminal: npm start

- **Don't close terminals** - the servers need to keep running

- **.env file is SECRET** - Never commit to GitHub!
  - Already in .gitignore

- **Password is hashed** - You won't see raw password in database

- **JWT token expires** - Users need to login again every 7 days

- **Uploads are stored** - In `/uploads/` folder on server

---

## 🎯 YOU'RE READY WHEN

All checkboxes are marked ✅ above!

If not, go back and complete the missing steps.

---

## 🚀 NEXT STEPS

1. Follow this checklist
2. Complete all items
3. Run the application
4. Test all features
5. You're ready to develop further!

---

**Good luck! You've got this! 🎉**

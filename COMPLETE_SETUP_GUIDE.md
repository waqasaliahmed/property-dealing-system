# 🏠 PROPERTY MANAGEMENT APPLICATION - COMPLETE SETUP GUIDE

## 📋 PROJECT OVERVIEW
- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Features**: User Authentication, Admin Property Management, Property Listing with Search & Filter

---

## ⚙️ INSTALLATION & SETUP (Step by Step)

### STEP 1: Install Required Software

#### 1.1 Install Node.js and npm
- Go to https://nodejs.org/
- Download **LTS** version (Long Term Support)
- Run the installer and follow instructions
- **Verify Installation**:
  ```powershell
  node --version
  npm --version
  ```
  You should see version numbers, e.g., v18.16.0

#### 1.2 Install MongoDB
**Option A: Install Locally on Windows**
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Run installer
4. Choose "Install MongoDB as a Service"
5. Installation path: Keep default `C:\Program Files\MongoDB\Server\7.0\`
6. **MongoDB will start automatically as Windows Service**

**Option B: Use MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free
3. Create a cluster
4. Get connection string like: `mongodb+srv://username:password@cluster.mongodb.net/database`

**Verify MongoDB Installation**:
- Open PowerShell as Admin
- Run: `mongod --version`
- Should show version (e.g., db version v7.0.0)

**Note**: If you installed locally, MongoDB runs automatically. If using Atlas, you'll use cloud connection string.

---

### STEP 2: Clone or Navigate to Project Folder

Open PowerShell and navigate to your project:
```powershell
cd C:\Users\Super\OneDrive\Desktop\property
```

---

### STEP 3: Setup BACKEND

#### 3.1 Navigate to Backend Folder
```powershell
cd backend
```

#### 3.2 Install Backend Dependencies
```powershell
npm install
```
This will install:
- express (web framework)
- mongoose (MongoDB library)
- bcryptjs (password encryption)
- jsonwebtoken (JWT for authentication)
- dotenv (environment variables)
- cors (Cross-Origin Resource Sharing)
- multer (file upload handler)
- nodemon (auto-restart during development)

#### 3.3 Create .env File
Create a new file named `.env` in the backend folder:

**IF USING LOCAL MONGODB:**
```
MONGODB_URI=mongodb://localhost:27017/property_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000
UPLOAD_PATH=./uploads
```

**IF USING MONGODB ATLAS (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000
UPLOAD_PATH=./uploads
```

⚠️ **Replace `username` and `password` with your MongoDB Atlas credentials**

#### 3.4 Start Backend Server
**Development Mode** (recommended - auto-restarts on file changes):
```powershell
npm run dev
```

**Production Mode**:
```powershell
npm start
```

✅ You should see:
```
✓ MongoDB Connected Successfully
🚀 Server running on http://localhost:5000
```

**Keep this terminal/PowerShell window open!**

---

### STEP 4: Setup FRONTEND (Open NEW PowerShell Window)

#### 4.1 Open NEW PowerShell Window
- Don't close the backend one!
- Open a new PowerShell/CMD window

#### 4.2 Navigate to Frontend Folder
```powershell
cd C:\Users\Super\OneDrive\Desktop\property\frontend
```

#### 4.3 Install Frontend Dependencies
```powershell
npm install
```

#### 4.4 Create uploads Folder (for backend)
Go back to backend folder and create uploads folder:
```powershell
cd ../backend
mkdir uploads
```

#### 4.5 Start Frontend Server
Go back to frontend:
```powershell
cd ../frontend
npm start
```

✅ React app automatically opens at: http://localhost:3000

---

## 🗄️ DATABASE STRUCTURE (MongoDB)

### User Collection Schema
```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  phoneNumber: "03001234567",
  role: "admin" or "user",  // default: user
  address: "123 Main St",
  profileImage: null,
  createdAt: Date,
  updatedAt: Date
}
```

### Property Collection Schema
```javascript
{
  title: "Plot" | "House" | "Land" | "Apartment" | "Commercial",
  ownerName: "Ahmed Khan",
  ownerEmail: "ahmed@example.com",
  ownerPhone: "03001234567",
  area: {
    value: 5,
    unit: "Marla" | "Kanal" | "Acre" | etc
  },
  location: {
    city: "Lahore",
    area: "Defence",
    address: "Street 123",
    coordinates: { latitude: 0, longitude: 0 }
  },
  price: 5000000,
  description: "Beautiful property with garden...",
  amenities: ["Parking", "Garden", "Pool"],
  images: [
    { url: "/uploads/image1.jpg", uploadedAt: Date }
  ],
  verificationStatus: "pending" | "verified" | "rejected",
  documents: [...],
  ownershipHistory: [...],
  createdBy: "userId (admin who listed it)",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 API ENDPOINTS

### Authentication Endpoints
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - User login
GET    /api/auth/me           - Get current user (requires token)
```

### Property Endpoints
```
GET    /api/properties                  - Get all verified properties (public)
GET    /api/properties/:id              - Get single property details
POST   /api/properties                  - Create property (admin only)
PUT    /api/properties/:id              - Update property (admin only)
DELETE /api/properties/:id              - Delete property (admin only)
PATCH  /api/properties/:id/verify       - Verify/reject property (admin only)
```

---

## 🧑‍💻 HOW TO USE THE APPLICATION

### For Regular Users

#### 1. Register Account
- Go to http://localhost:3000/register
- Enter Full Name, Email, Password, Phone, Address
- Click Register
- You're logged in as **user role**

#### 2. Browse Properties
- Go to Home page
- Search by location, price range
- Click property to view details
- See owner information and images

#### 3. View Property Details
- Click on any property card
- View full information, images gallery
- See owner contact details
- Check verification status

### For Admin Users

#### 1. Create Admin Account (Manual - Database Method)
Option 1: Using MongoDB Compass
- Open MongoDB Compass
- Connect to your database
- Go to `property_management` > `users` collection
- Insert document:
```json
{
  "fullName": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$...(bcrypt hashed password)",
  "phoneNumber": "03001234567",
  "role": "admin",
  "address": "Admin Office",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

Option 2: Register as user, then update database
- Register normally
- Connect to database using MongoDB Compass
- Find your user document
- Change `role` from "user" to "admin"

#### 2. Admin Dashboard
- Login with admin account
- Go to http://localhost:5000/admin/dashboard
- See all properties and their verification status

#### 3. Add Property (Admin)
- Click "Add Property" button
- Fill in:
  - Property type (Plot, House, Land, etc.)
  - Owner name, email, phone
  - Area (value + unit)
  - Location (city, area, address)
  - Price in PKR
  - Description (optional)
  - Amenities (comma-separated)
  - Upload up to 10 images
- Click "Create Property"
- Property appears as "pending verification"

#### 4. Verify Properties
- Go to Admin Dashboard
- See properties with "Pending" status
- Click "✓ Verify" to approve
- Click "✗ Reject" to reject
- Verified properties show to all users

#### 5. Delete Property
- In Admin Dashboard
- Click "Delete" button
- Property is permanently removed

---

## 📁 FILE STRUCTURE & PATH EXPLANATION

```
property/
│
├── backend/                          ← Backend Node.js server
│   ├── config/
│   │   └── database.js              ← MongoDB connection file
│   ├── models/                       ← Database schemas
│   │   ├── User.js                  ← User model (email, password, role)
│   │   └── Property.js              ← Property model (all property fields)
│   ├── controllers/                  ← Business logic
│   │   ├── authController.js        ← Register, login functions
│   │   └── propertyController.js    ← Create, read, update, delete properties
│   ├── middleware/                   ← Authentication & file upload
│   │   ├── auth.js                  ← JWT verification
│   │   └── upload.js                ← Image upload handler
│   ├── routes/                       ← API endpoints
│   │   ├── authRoutes.js            ← /api/auth/* endpoints
│   │   └── propertyRoutes.js        ← /api/properties/* endpoints
│   ├── uploads/                      ← Uploaded images (created automatically)
│   ├── .env                          ← Environment variables (CREATE THIS!)
│   ├── .env.example                  ← Template for .env
│   ├── server.js                     ← Main server file
│   ├── package.json                  ← Dependencies list
│   └── README.md                     ← Backend documentation
│
└── frontend/                         ← React.js frontend
    ├── public/
    │   └── index.html               ← Main HTML file
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js            ← Navigation bar component
    │   ├── pages/
    │   │   ├── Login.js             ← Login page
    │   │   ├── Register.js          ← Registration page
    │   │   ├── PropertyList.js      ← Home page (all properties)
    │   │   ├── PropertyDetail.js    ← Individual property details
    │   │   ├── AdminDashboard.js    ← Admin properties management
    │   │   └── AddProperty.js       ← Admin add property form
    │   ├── utils/
    │   │   └── api.js               ← API calls to backend
    │   ├── App.js                   ← Main app component
    │   ├── App.css                  ← All styles
    │   └── index.js                 ← Entry point
    ├── package.json                 ← Dependencies list
    └── README.md                    ← Frontend documentation
```

### Key File Locations & What They Do

| File | Location | Purpose |
|------|----------|---------|
| **.env** | `backend/.env` | Stores MongoDB URL, JWT secret, port number |
| **server.js** | `backend/server.js` | Starts Express server |
| **User model** | `backend/models/User.js` | Defines user schema (email, password, role) |
| **Property model** | `backend/models/Property.js` | Defines property schema (title, price, images, etc.) |
| **Auth controller** | `backend/controllers/authController.js` | Login/register logic |
| **Property controller** | `backend/controllers/propertyController.js` | CRUD operations for properties |
| **Auth routes** | `backend/routes/authRoutes.js` | /api/auth/* endpoints |
| **Property routes** | `backend/routes/propertyRoutes.js` | /api/properties/* endpoints |
| **JWT middleware** | `backend/middleware/auth.js` | Protects routes, verifies tokens |
| **Upload middleware** | `backend/middleware/upload.js` | Handles image uploads |
| **Navbar component** | `frontend/src/components/Navbar.js` | Top navigation bar |
| **App.js** | `frontend/src/App.js` | Routes configuration |
| **API utility** | `frontend/src/utils/api.js` | Makes requests to backend |

---

## 🛠️ TROUBLESHOOTING

### Problem: "MongoDB Connection Error"
**Solution:**
- Ensure MongoDB service is running (Windows Services)
- Check .env file has correct `MONGODB_URI`
- If using local: `mongodb://localhost:27017/property_management`
- If using Atlas: check username, password, cluster name

### Problem: "Port 5000 already in use"
**Solution:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Problem: "Port 3000 already in use"
**Solution:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Problem: Image upload not working
**Solution:**
- Ensure `uploads/` folder exists in backend
- Check file size is less than 5MB
- Only JPEG, PNG, GIF, WebP allowed

### Problem: "CORS error"
**Solution:**
- Check `.env` file has `CORS_ORIGIN=http://localhost:3000`
- Backend and frontend must be on different ports

---

## 🎯 QUICK START CHECKLIST

- [ ] Install Node.js and npm
- [ ] Install MongoDB (local or Atlas account)
- [ ] Create backend `.env` file
- [ ] Run `npm install` in backend folder
- [ ] Run `npm run dev` in backend folder → http://localhost:5000
- [ ] Open NEW PowerShell, navigate to frontend
- [ ] Run `npm install` in frontend folder
- [ ] Run `npm start` in frontend folder → http://localhost:3000
- [ ] Create admin user in database
- [ ] Register as user and test login
- [ ] Login as admin and create properties
- [ ] Verify a property and see it on home page

---

## 📝 ENVIRONMENT VARIABLES EXPLAINED

**`.env` file in backend:**

| Variable | Example | Explanation |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/property_management` | URL to MongoDB database |
| `PORT` | `5000` | Server port number |
| `JWT_SECRET` | `abc123xyz` | Secret key for authentication tokens |
| `CORS_ORIGIN` | `http://localhost:3000` | Allow requests from React frontend |
| `NODE_ENV` | `development` | Environment mode |

---

## 🚀 DEPLOYMENT (Future Reference)

When ready to deploy:
1. Frontend → Vercel, Netlify, or AWS
2. Backend → Heroku, Railway, or AWS
3. Database → MongoDB Atlas (cloud)
4. Update `.env` with production URLs

---

## 📞 API TESTING

### Register User
```
POST http://localhost:5000/api/auth/register
Headers: Content-Type: application/json
Body:
{
  "fullName": "John Doe",
  "email": "john@test.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "john@test.com",
  "password": "password123"
}
Response includes token → save this!
```

### Get Properties
```
GET http://localhost:5000/api/properties
(No authentication needed)
```

### Create Property (Admin)
```
POST http://localhost:5000/api/properties
Headers: 
  Authorization: Bearer <your_token>
  Content-Type: multipart/form-data
Body: (form data with images)
```

Use **Postman** or **Insomnia** for API testing!

---

## ✅ YOU'RE ALL SET!

Your application is now ready to run. Start with:
1. Backend: `npm run dev`
2. Frontend: `npm start`
3. Visit http://localhost:3000
4. Register, login, explore properties!

For any questions, check the README files in backend/ and frontend/ folders.

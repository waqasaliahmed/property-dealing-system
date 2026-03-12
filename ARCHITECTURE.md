# 📊 PROJECT ARCHITECTURE DIAGRAM

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    YOUR PROPERTY MANAGEMENT APP                  │
└──────────────────────────────────────────────────────────────────┘

                          BROWSER
                     http://localhost:3000
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │      FRONTEND - React.js                │
        │  ┌───────────────────────────────────┐  │
        │  │ Pages:                            │  │
        │  │ • Login / Register                │  │
        │  │ • Property Listing (Search)       │  │
        │  │ • Property Details (Images)       │  │
        │  │ • Admin Dashboard (Verify)        │  │
        │  │ • Add Property Form (Images)      │  │
        │  └───────────────────────────────────┘  │
        │                                         │
        │  Axios HTTP Requests                    │
        └────────────────┬────────────────────────┘
                         │
          API Calls (JSON Request/Response)
                         │
                         ▼
    ┌──────────────────────────────────────────────────┐
    │         BACKEND - Node.js + Express             │
    │      http://localhost:5000/api                  │
    │  ┌────────────────────────────────────────────┐ │
    │  │ Routes:                                    │ │
    │  │ • POST   /auth/register                    │ │
    │  │ • POST   /auth/login                       │ │
    │  │ • GET    /auth/me                          │ │
    │  │ • GET    /properties (search/filter)       │ │
    │  │ • POST   /properties (admin only)          │ │
    │  │ • PUT    /properties/:id (admin only)      │ │
    │  │ • DELETE /properties/:id (admin only)      │ │
    │  │ • PATCH  /properties/:id/verify (admin)    │ │
    │  └────────────────────────────────────────────┘ │
    │                                                  │
    │  Controllers → Models → Database                │
    │  Middleware (Auth, Upload)                      │
    └────────────────┬─────────────────────────────────┘
                     │
            Database Queries (CRUD)
                     │
                     ▼
    ┌──────────────────────────────────────────────────┐
    │    DATABASE - MongoDB                            │
    │  ┌────────────────────────────────────────────┐ │
    │  │ Collections:                               │ │
    │  │ • users (email, password, role)            │ │
    │  │ • properties (title, price, images, etc)   │ │
    │  └────────────────────────────────────────────┘ │
    │                                                  │
    │  Data stored as JSON documents                  │
    └──────────────────────────────────────────────────┘
```

---

## Request Flow Example

### 1. User Registration Flow
```
User fills form → Submit
       │
       ▼
Frontend: Register.js
       │
axios.post('/auth/register', data)
       │
       ▼
Backend: authRoutes.js → authController.registerUser()
       │
       ▼
Validate input → Hash password → Save to MongoDB
       │
       ▼
Response: {token, user}
       │
       ▼
Frontend: Save token in localStorage
       │
       ▼
Redirect to home/dashboard
```

### 2. Property Creation Flow (Admin)
```
Admin fills form + uploads images → Submit
       │
       ▼
Frontend: AddProperty.js
       │
FormData with files + axios.post('/properties', formData, {
  headers: { Authorization: 'Bearer token' }
})
       │
       ▼
Backend: propertyRoutes → Middleware (auth check)
       │
       ▼
propertyController.createProperty()
       │
       ├─ Verify user is admin
       ├─ Upload images to /uploads folder
       ├─ Save property to MongoDB
       └─ Return property data
       │
       ▼
Frontend: Show success message
       │
       ▼
Redirect to admin dashboard
```

### 3. Property Listing Flow (Public)
```
User visits home page
       │
       ▼
Frontend: PropertyList.js
       │
useEffect → axios.get('/properties')
       │
       ▼
Backend: propertyRoutes → propertyController.getAllProperties()
       │
MongoDB: Find all documents where verificationStatus = 'verified'
       │
       ▼
Response: Array of properties
       │
       ▼
Frontend: Map through array → Display as cards
       │
       ▼
User clicks property → Navigate to PropertyDetail/:id
```

---

## Folder Structure & Purpose

```
backend/
├─ server.js ........................... Entry point, starts Express
├─ config/database.js .................. MongoDB connection
├─ models/ ............................ Database schemas
│  ├─ User.js .......................... What a user document looks like
│  └─ Property.js ...................... What a property document looks like
├─ controllers/ ........................ Business logic
│  ├─ authController.js ................ register, login functions
│  └─ propertyController.js ............ CRUD operations
├─ routes/ ............................ API endpoints
│  ├─ authRoutes.js .................... /api/auth/* paths
│  └─ propertyRoutes.js ................ /api/properties/* paths
├─ middleware/ ........................ Protection & uploads
│  ├─ auth.js .......................... Checks JWT token
│  └─ upload.js ........................ Handles image files
└─ uploads/ ........................... Stores uploaded images

frontend/
├─ public/index.html .................. Main HTML file
├─ src/components/ .................... Reusable components
│  └─ Navbar.js ........................ Top navigation bar
├─ src/pages/ ......................... Full pages
│  ├─ Login.js, Register.js ............ Auth pages
│  ├─ PropertyList.js ................. Home page
│  ├─ PropertyDetail.js ............... Property details
│  ├─ AdminDashboard.js ............... Admin panel
│  └─ AddProperty.js .................. Admin form
├─ src/utils/ ......................... Helper functions
│  └─ api.js ........................... Axios setup
├─ App.js ............................. Main component, routing
└─ App.css ............................ All styles
```

---

## Technology Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                       │
│                  (React Frontend)                       │
└────────────────────────┬────────────────────────────────┘
                         │
            HTTP/HTTPS JSON Requests/Responses
                         │
┌────────────────────────┴────────────────────────────────┐
│               EXPRESS SERVER                            │
│         (Node.js + Middleware Stack)                    │
│  1. Route handler                                       │
│  2. Auth middleware (verify JWT)                        │
│  3. Upload middleware (handle files)                    │
│  4. Controller (business logic)                         │
│  5. Model (database schema)                             │
└────────────────────────┬────────────────────────────────┘
                         │
           Mongoose Driver (Node.js ↔ MongoDB)
                         │
┌────────────────────────┴────────────────────────────────┐
│            MONGODB DATABASE                             │
│      (Data stored as JSON documents)                    │
│  Collections:                                           │
│    • users: [{_id, name, email, password, role, ...}]  │
│    • properties: [{_id, title, price, images, ...}]    │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────┐
│              USER REGISTRATION                       │
└──────────────────┬───────────────────────────────────┘
                   │
User submits: email + password
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│   Backend: Register Route                            │
│   1. Validate input (email format, password length)  │
│   2. Check if email already exists in database       │
│   3. Hash password (bcryptjs)                        │
│   4. Create new user document in MongoDB             │
│   5. Generate JWT token                              │
│   6. Return token + user data                        │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│   Frontend: Save & Navigate                          │
│   1. Save token in localStorage                      │
│   2. Save userRole in localStorage                   │
│   3. Redirect to home or admin dashboard             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│              SUBSEQUENT REQUESTS                      │
└──────────────────┬───────────────────────────────────┘
                   │
┌──────────────────────────────────────────────────────┐
│   Frontend: Add Token to Headers                      │
│   Authorization: Bearer <token>                       │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│   Backend: Auth Middleware                           │
│   1. Get token from Authorization header             │
│   2. Verify token with JWT secret                    │
│   3. Extract user ID & role from token               │
│   4. Attach to request object                        │
│   5. Pass to controller                              │
└──────────────────────────────────────────────────────┘
```

---

## File Upload Flow

```
User selects images in form
              │
              ▼
FormData object (multipart/form-data)
              │
              ▼
axios.post('/properties', formData)
              │
              ▼
Backend: multer middleware.array('images', 10)
    • Receives up to 10 files
    • Validates: Only JPEG, PNG, GIF, WebP
    • Max 5MB per file
    • Saves to /uploads/ folder with unique names
              │
              ▼
Controller: createProperty()
    • Reads file paths from req.files
    • Stores paths in MongoDB
    • Returns URLs like /uploads/images-123456.jpg
              │
              ▼
Frontend: Display images
    <img src="http://localhost:5000/uploads/images-123456.jpg" />
```

---

## Admin Property Verification Workflow

```
┌──────────────────────────────────────────────────┐
│   Admin Adds Property (via AddProperty.js)       │
│   Status: "pending"                              │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│   Property Saved in MongoDB                      │
│   {title, price, images, status: "pending", ...} │
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│   Property Not Visible to Users                  │
│   (getAllProperties filters: status = "verified")│
└────────────┬─────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────┐
│   Admin Views Dashboard (AdminDashboard.js)     │
│   Sees all properties including pending          │
└────────────┬─────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
 VERIFY             REJECT
status: "verified"  status: "rejected"
    │                 │
    ▼                 ▼
Visible to Users    Not visible to users
on home page        (only admin sees)
```

---

## Data Flow Summary

```
INPUT (User Action)
    │
    ▼
FRONTEND 
    │ → Collect data
    │ → Validate
    │ → Send HTTP request with axios
    │
    ▼
API REQUEST
    │ → POST /api/auth/register
    │ → POST /api/properties  
    │ → GET /api/properties
    │ → etc.
    │
    ▼
BACKEND
    │ → Routes (authRoutes.js, propertyRoutes.js)
    │ → Middleware (auth.js for protection, upload.js for files)
    │ → Controllers (authController.js, propertyController.js)
    │ → Models (User.js, Property.js)
    │
    ▼
DATABASE (MongoDB)
    │ → CRUD Operations
    │ → Create documents
    │ → Read/Query documents
    │ → Update documents
    │ → Delete documents
    │
    ▼
RESPONSE
    │ → Return JSON data back to frontend
    │ → HTTP 200 (success) or error codes
    │
    ▼
FRONTEND UPDATE
    │ → Display data
    │ → Update UI
    │ → Show success/error messages
    │
    ▼
OUTPUT (User Sees Result)
```

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────┐
│         LOCAL DEVELOPMENT (Current)                 │
│  Frontend: localhost:3000                          │
│  Backend: localhost:5000                           │
│  Database: localhost:27017                         │
└─────────────────────────────────────────────────────┘
                      │
                      │ (When ready to deploy)
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌────────┐      ┌────────┐      ┌──────────┐
│Vercel/ │      │ Heroku/│      │ MongoDB  │
│Netlify │      │Railway │      │ Atlas    │
│(Frontend)    │(Backend)     │(Database)│
└────────┘      └────────┘      └──────────┘

User → CDN → Static frontend → API calls → Backend → Database
```

---

## You've Got the Complete Picture! 🎯

Now you understand:
- How frontend talks to backend
- How backend stores data in database
- How authentication works
- How files are uploaded
- How properties are verified

**Next: Create .env file and run the app!**

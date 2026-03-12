# 🚀 QUICK START GUIDE

## Prerequisites Installed?
- ✅ Node.js (from https://nodejs.org)
- ✅ MongoDB (local or Atlas account)

## Let's Go! (5 minutes setup)

### Step 1: Setup Backend (Terminal 1)
```powershell
cd C:\Users\Super\OneDrive\Desktop\property\backend

# Create .env file with this content:
# MONGODB_URI=mongodb://localhost:27017/property_management
# PORT=5000
# JWT_SECRET=my_secret_key_123
# CORS_ORIGIN=http://localhost:3000

npm install
npm run dev
```
✅ You'll see: `🚀 Server running on http://localhost:5000`

### Step 2: Setup Frontend (Terminal 2 - NEW)
```powershell
cd C:\Users\Super\OneDrive\Desktop\property\frontend
npm install
npm start
```
✅ App opens at http://localhost:3000

### Step 3: Use the App
1. **Register**: Create account
2. **Login**: Login to app
3. **Make Admin**: Go to MongoDB, change role from "user" to "admin"
4. **Add Properties**: Login with admin account, add properties
5. **Verify**: Go to admin dashboard and verify properties
6. **View**: Users can now search and view properties

---

## 📂 Important Paths

| What | Where |
|------|-------|
| Backend Code | `c:\Users\Super\OneDrive\Desktop\property\backend` |
| Frontend Code | `c:\Users\Super\OneDrive\Desktop\property\frontend` |
| Database Config | `backend\.env` |
| Images Uploaded | `backend\uploads\` |
| Server Running | `http://localhost:5000` |
| App Running | `http://localhost:3000` |

---

## 🔑 Credentials Example

**Test User (Regular)**
- Email: user@test.com
- Password: password123

**Test Admin** (create in MongoDB)
- Email: admin@test.com
- Password: admin123 (hashed)
- role: "admin"

---

## 💡 Common Commands

```powershell
# Backend development
npm run dev          # Auto-restart on changes
npm start            # Production mode

# Frontend
npm start            # Start React app
npm build            # Build for production

# Stop servers
Ctrl + C             # In any terminal
```

---

## 🆘 Issues?

| Issue | Fix |
|-------|-----|
| "MongoDB Connection Error" | Check .env MONGODB_URI, ensure MongoDB running |
| "Port already in use" | Kill process: `taskkill /F /PID <number>` |
| "Cannot find module" | Run `npm install` again |
| "CORS error" | Check .env CORS_ORIGIN is `http://localhost:3000` |

---

Read **COMPLETE_SETUP_GUIDE.md** for detailed information!

# MongoDB Setup Guide

## Quick Check: Is MongoDB Running?

### Windows Command Prompt
```powershell
netstat -an | findstr :27017
```

If you see `LISTENING`, MongoDB is running. Otherwise, proceed to installation.

---

## Option 1: Local MongoDB (Recommended for Development)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (5.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Click "Next" through the installer
3. **IMPORTANT:** Check "Install MongoDB as a Service"
4. Select "Run service as Local System"
5. Click "Install"
6. MongoDB service will start automatically

### Step 3: Verify Installation
```powershell
# Check that MongoDB service is running
Get-Service MongoDB

# Should output something like:
# Status   Name                DisplayName
# ------   ----                -----------
# Running  MongoDB             MongoDB
```

### Step 4: Test Connection
```powershell
# Open Command Prompt and run:
mongosh

# You should see:
# test> (this is the MongoDB shell prompt)
# Type: exit to quit
```

### Step 5: Create Database
```javascript
// In mongosh shell
use property_management

// Create collections
db.users.insertOne({
  fullName: "Test User",
  email: "test@example.com",
  role: "user"
})

db.properties.insertOne({
  title: "Plot",
  ownerName: "Owner Name",
  price: 5000000
})

// List all databases
show dbs

// You should see: property_management
```

---

## Option 2: MongoDB Atlas (Cloud MongoDB)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google
4. Verify your email

### Step 2: Create a Cluster
1. Click "Create a Deployment"
2. Select "Free" tier
3. Select region closest to you (e.g., us-east-1)
4. Click "Create Deployment"
5. Wait 5-10 minutes for cluster to deploy

### Step 3: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Enter:
   - Username: `admin`
   - Password: `YourSecurePassword123`
   - Role: `Atlas Admin`
4. Click "Add User"

### Step 4: Get Connection String
1. Go to "Database" / "Clusters"
2. Click "Connect" button
3. Select "Drivers" → "Node.js"
4. Copy the connection string

### Step 5: Update .env
```dotenv
# Replace this:
MONGODB_URI=mongodb://localhost:27017/property_management

# With this (paste from step 4):
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/property_management?retryWrites=true&w=majority
```

### Step 6: IP Whitelist
1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for development)
4. In production, specify your server IP

---

## Verify MongoDB Connection

### Using Backend Server
```powershell
cd backend
npm start

# Look for output:
# ✓ MongoDB Connected Successfully
# 🚀 Server running on http://localhost:5000

# If you see connection error, MongoDB is not configured properly
```

### Using mongosh (Local Only)
```powershell
# Start mongosh
mongosh

# Check databases
show dbs

# Select property database
use property_management

# Check collections
show collections

# View users
db.users.find()

# View properties
db.properties.find()
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  fullName: "John Doe",
  email: "john@example.com",
  password: "$2b$10$...", // hashed password
  phoneNumber: "03001234567",
  address: "123 Street, City",
  role: "admin", // or "user"
  createdAt: ISODate("2025-02-25T10:00:00Z"),
  updatedAt: ISODate("2025-02-25T10:00:00Z")
}
```

### Properties Collection
```javascript
{
  _id: ObjectId,
  title: "Plot",
  ownerName: "Muhammad Ahmed",
  ownerEmail: "owner@example.com",
  ownerPhone: "03001234567",
  area: {
    value: 5,
    unit: "Marla"
  },
  location: {
    city: "Lahore",
    area: "Defence",
    address: "House 123, Street XYZ",
    coordinates: {
      lat: 31.5204,
      lng: 74.3587
    }
  },
  price: 50000000,
  description: "Beautiful plot in prime location",
  amenities: ["Parking", "Garden"],
  images: [
    {
      url: "/uploads/image-123456.jpg",
      uploadedAt: ISODate("2025-02-25T10:00:00Z")
    }
  ],
  verificationStatus: "verified", // pending, verified, rejected
  createdBy: ObjectId("..."), // Reference to user
  createdAt: ISODate("2025-02-25T10:00:00Z"),
  updatedAt: ISODate("2025-02-25T10:00:00Z")
}
```

---

## Common MongoDB Issues

### Error: "ECONNREFUSED 127.0.0.1:27017"
**Cause:** MongoDB is not running

**Solution:**
```powershell
# Windows
net start MongoDB

# Or restart the service
Stop-Service MongoDB
Start-Service MongoDB

# Verify it's running
netstat -an | findstr :27017
```

### Error: "MongoServerError: Authentication failed"
**Cause:** Wrong username/password in connection string

**Solution:**
- Check .env file has correct credentials
- Verify user exists in MongoDB Atlas
- Check IP is whitelisted (Atlas only)

### Error: "ENOENT" when trying to connect
**Cause:** .env file missing

**Solution:**
```powershell
# In backend directory, create .env file:
echo 'MONGODB_URI=mongodb://localhost:27017/property_management' > .env
echo 'PORT=5000' >> .env
echo 'JWT_SECRET=your_secret_key' >> .env
echo 'NODE_ENV=development' >> .env
echo 'CORS_ORIGIN=http://localhost:3000' >> .env
```

### Error: "database name cannot contain //?:"
**Cause:** Wrong URI format in .env

**Solution:**
```dotenv
# WRONG:
MONGODB_URI=mongodb://localhost:27017//property_management

# CORRECT:
MONGODB_URI=mongodb://localhost:27017/property_management

# FOR ATLAS:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/property_management?retryWrites=true&w=majority
```

---

## MongoDB Commands Reference

### Connect to Database
```bash
mongosh
use property_management
```

### View Data
```javascript
// Show all users
db.users.find()

// Show all properties
db.properties.find()

// Find specific user
db.users.findOne({ email: "admin@example.com" })

// Find properties by city
db.properties.find({ "location.city": "Lahore" })

// Count properties
db.properties.countDocuments()
```

### Create Data
```javascript
// Create admin user
db.users.insertOne({
  fullName: "Admin User",
  email: "admin@example.com",
  password: "$2b$10$hashedpassword",
  phoneNumber: "03001234567",
  role: "admin"
})
```

### Update Data
```javascript
// Update user role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

// Update property status
db.properties.updateOne(
  { _id: ObjectId("...") },
  { $set: { verificationStatus: "verified" } }
)
```

### Delete Data
```javascript
// Delete property
db.properties.deleteOne({ _id: ObjectId("...") })

// Delete user
db.users.deleteOne({ email: "user@example.com" })
```

### Create Indexes (for performance)
```javascript
// Index for faster user lookup
db.users.createIndex({ email: 1 })

// Index for faster property search
db.properties.createIndex({ "location.city": 1 })
db.properties.createIndex({ verificationStatus: 1 })
```

---

## Backup & Restore

### Backup Database (Local)
```powershell
mongodump --db property_management --out "D:\backups"
```

### Restore Database (Local)
```powershell
mongorestore --db property_management "D:\backups\property_management"
```

### Backup to Atlas
- Use MongoDB Compass GUI
- Or use automated backups in Atlas console

---

## Performance Tips

1. **Create Indexes** - Speed up searches
   ```javascript
   db.properties.createIndex({ "location.city": 1 })
   db.properties.createIndex({ verificationStatus: 1 })
   ```

2. **Limit Results** - For queries with many results
   ```javascript
   db.properties.find().limit(10).skip(0)
   ```

3. **Use Projection** - Return only needed fields
   ```javascript
   db.properties.find({}, { title: 1, price: 1, owner: 1 })
   ```

4. **Monitor Performance**
   ```javascript
   // In mongosh
   db.setProfilingLevel(1)
   db.system.profile.find().limit(5)
   ```

---

## Production Checklist

- ✅ Use MongoDB Atlas (not local for production)
- ✅ Enable authentication (username/password)
- ✅ Whitelist only your server IP
- ✅ Enable encryption at rest
- ✅ Enable backup & restore
- ✅ Use connection pooling
- ✅ Monitor database performance
- ✅ Set up alerts for issues
- ✅ Regular backups (automated)
- ✅ Use strong passwords

---

## Useful Links

- MongoDB Download: https://www.mongodb.com/try/download/community
- MongoDB Compass (GUI): https://www.mongodb.com/products/compass
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- mongosh Shell: https://www.mongodb.com/docs/products/shell/
- Documentation: https://www.mongodb.com/docs/

---

**Still having issues?** Check the QUICK_REFERENCE.md file for troubleshooting

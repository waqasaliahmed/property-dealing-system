# Property Management Frontend

## Project Structure

```
frontend/
├── public/
│   └── index.html           # Main HTML file
├── src/
│   ├── components/
│   │   └── Navbar.js        # Navigation bar
│   ├── pages/
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   ├── PropertyList.js  # List all properties
│   │   ├── PropertyDetail.js # Property details
│   │   ├── AdminDashboard.js # Admin dashboard
│   │   └── AddProperty.js   # Add property form
│   ├── utils/
│   │   └── api.js           # API calls
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── .env (create if needed)
```

## Setup Instructions

### 1. Install Node.js
   - Download from https://nodejs.org/
   - Verify: `node --version` and `npm --version`

### 2. Install Dependencies
   - Navigate to frontend folder
   - Run: `npm install`

### 3. Start React Development Server
   - Run: `npm start`
   - App opens at http://localhost:3000

### 4. Create .env file (Optional)
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

const mongoose = require('mongoose');
const dns = require('dns');

// Use Google Public DNS to resolve MongoDB Atlas SRV records
// (fixes networks where local DNS blocks SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async (retries = 5, delay = 5000) => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/property_management';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });

      console.log('✓ MongoDB Connected Successfully');
      return true;
    } catch (error) {
      console.error(`✗ MongoDB Connection Attempt ${attempt}/${retries} Failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`  Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error('✗ All MongoDB connection attempts failed.');
  console.error('Please ensure MongoDB is running or check your MONGODB_URI in .env');
  console.error('The server will continue running but database operations will fail.');
  return false;
};

module.exports = connectDB;

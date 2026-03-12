const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/property';

const initDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = mongoose.connection.db;
    const adminDb = db.admin();

    // Get list of existing databases
    const adminStats = await adminDb.listDatabases();
    const databaseNames = adminStats.databases.map(db => db.name);
    
    console.log('\n📊 Existing Databases:');
    databaseNames.forEach(dbName => console.log(`   - ${dbName}`));

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    console.log('\n📋 Existing Collections:');
    if (collectionNames.length === 0) {
      console.log('   (none - will create below)');
    } else {
      collectionNames.forEach(colName => console.log(`   - ${colName}`));
    }

    // Create Users collection if it doesn't exist
    if (!collectionNames.includes('users')) {
      console.log('\n➕ Creating "users" collection...');
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'email', 'password', 'role'],
            properties: {
              _id: { bsonType: 'objectId' },
              username: { bsonType: 'string', description: 'User username' },
              email: { bsonType: 'string', description: 'User email' },
              password: { bsonType: 'string', description: 'Hashed password' },
              role: { 
                enum: ['admin', 'user'],
                description: 'User role'
              },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });

      // Create indexes on users collection
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      console.log('   ✅ Users collection created with indexes');
    } else {
      console.log('\n✓ Users collection already exists');
    }

    // Create Properties collection if it doesn't exist
    if (!collectionNames.includes('properties')) {
      console.log('\n➕ Creating "properties" collection...');
      await db.createCollection('properties', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'ownerName', 'city', 'area', 'price'],
            properties: {
              _id: { bsonType: 'objectId' },
              title: { bsonType: 'string', description: 'Property type' },
              ownerName: { bsonType: 'string' },
              ownerEmail: { bsonType: 'string' },
              ownerPhone: { bsonType: 'string' },
              city: { bsonType: 'string' },
              area: { bsonType: 'string' },
              areaValue: { bsonType: 'double' },
              areaUnit: { bsonType: 'string' },
              address: { bsonType: 'string' },
              price: { bsonType: 'double' },
              description: { bsonType: 'string' },
              amenities: { bsonType: 'array' },
              images: { bsonType: 'array' },
              verified: { bsonType: 'bool' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' }
            }
          }
        }
      });

      // Create indexes on properties collection
      await db.collection('properties').createIndex({ city: 1 });
      await db.collection('properties').createIndex({ price: 1 });
      await db.collection('properties').createIndex({ createdAt: -1 });
      console.log('   ✅ Properties collection created with indexes');
    } else {
      console.log('\n✓ Properties collection already exists');
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📌 Database Details:');
    console.log(`   Database Name: property`);
    console.log(`   Connection String: ${mongoURI}`);
    console.log(`   Collections: users, properties`);

    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
};

initDatabase();

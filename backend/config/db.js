const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || (
    process.env.NODE_ENV !== 'production'
      ? 'mongodb://localhost:27017/real_estate_crm'
      : null
  );

  if (!mongoURI) {
    console.error('===============================================================');
    console.error('CRITICAL: MONGO_URI environment variable is missing!');
    console.error('Please configure MONGO_URI in your Render Dashboard or .env file.');
    console.error('Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/real_estate_crm?retryWrites=true&w=majority');
    console.error('===============================================================');
    process.exit(1);
  }

  try {
    // Configure Mongoose options for MongoDB Atlas & cloud environments
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds timeout for cloud Atlas clusters
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes only in dev for performance
    });

    console.log(`✓ MongoDB Connected successfully: ${conn.connection.host}`);

    // Register runtime connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection lost. Reconnecting...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB connection restored.');
    });

    return conn;
  } catch (error) {
    console.error('===============================================================');
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Troubleshooting Tips for MongoDB Atlas:');
    console.error('1. Check Network Access in Atlas: Ensure 0.0.0.0/0 (Allow access from anywhere) is added.');
    console.error('2. Check Database User: Ensure the username and password in MONGO_URI are correct.');
    console.error('3. Check URI Encoding: If the password contains special characters (@, #, %, etc.), URL-encode them.');
    console.error('===============================================================');
    process.exit(1);
  }
};

module.exports = connectDB;

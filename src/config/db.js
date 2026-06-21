const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'fast_food_db';

  try {
    if (process.env.USE_MOCK_DB === 'true' || !uri || uri.includes('mock') || uri.trim() === '') {
      throw new Error('Forced mock database or invalid URI.');
    }
    console.log(`Connecting to MongoDB Database [${dbName}]...`);
    await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 3000 // Fast fail-over to trigger local mock fallback
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.warn(`WARNING: Failed to connect to MongoDB Atlas (${err.message}).`);
    console.warn('Falling back to local file-based database simulation (offline-first)...');
    
    const mockMongoose = require('./mongoose-mock');
    
    // Apply mongoose override to the mongoose singleton
    mockMongoose.applyOverride(mongoose);
  }
}

module.exports = connectDB;

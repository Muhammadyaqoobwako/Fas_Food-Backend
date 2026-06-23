require('dotenv').config();
const mongoose = require('mongoose');

// If using mock database, apply override synchronously before requiring other files
if (process.env.USE_MOCK_DB === 'true' || !process.env.MONGODB_URI) {
  const mockMongoose = require('./config/mongoose-mock');
  mockMongoose.applyOverride(mongoose);
}

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to Database first
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Modern API Server listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/status`);
  });
}).catch(err => {
  console.error("Database connection failed, starting server anyway...", err);
  app.listen(PORT, () => {
    console.log(`Modern API Server listening on port ${PORT} (Database Offline)`);
  });
});

module.exports = app;
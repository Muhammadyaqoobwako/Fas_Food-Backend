require('dotenv').config();
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
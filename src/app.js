const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Set global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuItemRoutes);

// Welcome / root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Fas_Food API Backend!",
    version: "1.0.0",
    endpoints: {
      status: "/api/status",
      auth: "/api/auth",
      orders: "/api/orders",
      menu: "/api/menu"
    }
  });
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'running',
    database: 'connected'
  });
});

// Fallback for unmapped API endpoints
app.use('*', (req, res, next) => {
  const error = new Error(`Resource not found: ${req.baseUrl}`);
  error.status = 404;
  next(error);
});

// Global error handler middleware
app.use(errorHandler);

module.exports = app;

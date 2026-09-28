// Main Server File: Sets up Express, MongoDB connection, middleware, and routes
// Environment Variables: PORT, MONGODB_URI, JWT_SECRET

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend to communicate with backend
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Global Error Handler Middleware
// Catches all errors that occur in async route handlers
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.message.includes('ECONNREFUSED')) {
    return res.status(503).json({ message: 'Database connection failed' });
  }

  // Handle invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

  
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
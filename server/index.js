require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Import route files
const restaurantRoutes = require('./routes/restaurantRoutes');
const queueRoutes = require('./routes/queueRoutes');
const notifyRoutes = require('./routes/notifyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const menuRoutes = require('./routes/menuRoutes');

// Config
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (e.g., restaurant logos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/menu', menuRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('✅ EasyQueue API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

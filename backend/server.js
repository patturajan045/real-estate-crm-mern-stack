const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();

const connectDB = require('./config/db');
const { seedDefaultsIfNeeded } = require('./utils/seedDefaults');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/leadRoutes');
const projectRoutes = require('./routes/projectRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const unitRoutes = require('./routes/unitRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security and Performance Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows CDN scripts/styles (Google Fonts, FontAwesome, DataTables)
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});

// Health Check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Real Estate CRM API is operational'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve React Client build in production
const clientDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(clientDistPath));

// Deep route fallback to SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ status: 'error', message: 'API route not found' });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Real Estate CRM API is operational. Client is starting or building...');
    }
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  connectDB().then(async () => {
    await seedDefaultsIfNeeded();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    server.on('error', (err) => {
      console.error('Server listener error:', err.message);
    });
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}

module.exports = app;

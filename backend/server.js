const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Trust reverse proxies (Render, Vercel, Cloudflare, AWS ALB) for rate limiting & secure cookies
app.set('trust proxy', 1);

// Security and Performance Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows CDN scripts/styles (Google Fonts, FontAwesome, DataTables)
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Parse allowed CORS origins from environment variable
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : [];

// Dynamic CORS configuration: Allows Vercel frontend, preview domains, localhost, and configured CLIENT_URL
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    // If wildcard '*' is in CLIENT_URL or in development mode, allow all origins
    if (allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Check specific allowed origins or any Vercel domain (*.vercel.app)
    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.endsWith('.vercel.app') ||
                      origin.includes('localhost') ||
                      origin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`[CORS Blocked] Request origin: ${origin}`);
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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

// Health Check endpoint for Render, uptime monitors, and load balancers
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'success',
    service: 'Real Estate Flow CRM API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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

// Static client path (for unified monorepo deployments)
const clientDistPath = path.join(__dirname, '../frontend/dist');
const hasClientBuild = fs.existsSync(path.join(clientDistPath, 'index.html'));

if (hasClientBuild) {
  app.use(express.static(clientDistPath));
}

// Root endpoint: Returns JSON API info for standalone backend on Render, or serves SPA if built
app.get('/', (req, res) => {
  if (hasClientBuild) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  return res.status(200).json({
    status: 'success',
    service: 'Real Estate Flow CRM API',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Backend API service is running on Render.',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      leads: '/api/leads',
      properties: '/api/projects',
      bookings: '/api/bookings',
      dashboard: '/api/dashboard/stats',
      users: '/api/users'
    }
  });
});

// Fallback route: SPA routing if client build exists, otherwise clean 404
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ status: 'error', message: 'API route not found' });
  }
  if (hasClientBuild) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  return res.status(404).json({
    status: 'error',
    message: `Route '${req.originalUrl}' not found. Frontend is deployed on Vercel.`
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
    
    // Bind to 0.0.0.0 for cloud container compatibility (Render, Docker)
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    server.on('error', (err) => {
      console.error('Server listener error:', err.message);
    });

    // Graceful Shutdown handling for Render container lifecycle
    const handleShutdown = (signal) => {
      console.log(`Received ${signal}. Gracefully shutting down server...`);
      server.close(() => {
        console.log('HTTP server closed.');
        const mongoose = require('mongoose');
        mongoose.connection.close(false).then(() => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  }).catch((err) => {
    console.error('Failed to start server:', err);
  });
}

module.exports = app;

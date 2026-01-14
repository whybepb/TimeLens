/**
 * TimeLens Backend - Express Server
 * Node.js API layer using Appwrite as database
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth.routes');
const goalsRoutes = require('./routes/goals.routes');
const logsRoutes = require('./routes/logs.routes');
const streaksRoutes = require('./routes/streaks.routes');
const focusRoutes = require('./routes/focus.routes');
const insightsRoutes = require('./routes/insights.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

// Security headers
app.use(helmet());

// CORS - allow React Native app
app.use(cors({
    origin: '*', // In production, restrict to your app's domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'TimeLens API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/streaks', streaksRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/insights', insightsRoutes);

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════╗
  ║   TimeLens API Server                  ║
  ║   Running on http://localhost:${PORT}     ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;

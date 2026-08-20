import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { pool } from './db.js';

import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import columnRoutes from './routes/columns.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CLIENT_ORIGIN',
];

for (const variable of requiredEnvVars) {
  if (!process.env[variable]) {
    console.error(`Missing required environment variable: ${variable}`);
    process.exit(1);
  }
}

const app = express();

// CORS
const clientOrigin = process.env.CLIENT_ORIGIN;

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Rate-limit authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Health check database error:', err);

    res.status(503).json({
      status: 'error',
      database: 'unavailable',
    });
  }
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/tasks', taskRoutes);

// Catch-all 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Route not found.',
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error.',
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Agile Kanban API listening on http://localhost:${PORT}`);
  });
}

export default app;
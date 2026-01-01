import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { testConnection } from './db/supabase';
import { errorHandler } from './middleware/errorHandler';
import { authenticate, optionalAuthenticate } from './middleware/auth';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import { codeGenController } from './controllers/codeGenController';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Debug env loading
console.log('[ENV DEBUG] MOCK_CLAUDE value:', process.env.MOCK_CLAUDE);

// Configure multer for memory storage (files kept in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10, // Max 10 files
  }
});

/**
 * Middleware Configuration
 */

// CORS - Allow frontend to access API
// NUCLEAR OPTION: Manually set CORS headers before everything
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled:', req.path);
    return res.status(200).end();
  }

  next();
});

// Also use cors middleware as backup
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parser with 10MB limit for large code files
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/**
 * Routes
 */

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'Breakly API',
    version: '1.0.0',
    description: 'AI-powered code generation platform',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Project routes (protected)
app.use('/api/projects', projectRoutes);

// Code generation routes - handle OPTIONS first for CORS preflight
app.options('/api/generate/stream', cors(corsOptions));
app.options('/api/generate', cors(corsOptions));
app.options('/api/generate/save', cors(corsOptions));

app.post('/api/generate/stream', optionalAuthenticate, upload.array('files', 10), codeGenController.streamGeneration);
app.post('/api/generate', optionalAuthenticate, upload.array('files', 10), codeGenController.generate);
app.post('/api/generate/save', authenticate, codeGenController.saveFiles);

// Handle all other OPTIONS requests
app.options('*', cors(corsOptions));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Server Initialization
 */
async function startServer() {
  try {
    // Test database connection (optional for demo mode)
    const dbConnected = await testConnection();
    const allowNoDb = (process.env.ALLOW_NO_DB || process.env.NODE_ENV === 'development') ? true : false;

    if (!dbConnected && !allowNoDb) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    if (!dbConnected && allowNoDb) {
      console.warn('⚠️  Database not connected. Continuing to start server in no-DB mode (code generation will work, persistence is disabled).');
    }

    // Start server
    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════╗');
      console.log('║   🚀 Breakly API Server               ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║   Port: ${PORT.toString().padEnd(31)} ║`);
      console.log(`║   Env:  ${(process.env.NODE_ENV || 'development').padEnd(31)} ║`);
      console.log(`║   URL:  http://localhost:${PORT.toString().padEnd(18)} ║`);
      console.log('╚════════════════════════════════════════╝');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

export default app;

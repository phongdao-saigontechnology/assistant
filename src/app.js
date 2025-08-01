import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import templateRoutes from './routes/templates.js';
import integrationRoutes from './routes/integrations.js';
import guidelinesRoutes from './routes/guidelines.js';
import demoRoutes from './routes/demo.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Environment loaded. GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "script-src-attr": ["'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Define base path for reverse proxy - check X-Forwarded-Prefix header first
const getBasePath = (req) => {
  return req.headers['x-forwarded-prefix'] || process.env.BASE_PATH || '/communication-assistant';
};
const BASE_PATH = process.env.BASE_PATH || '/communication-assistant';

// Static files - serve both with and without base path to handle nginx proxy stripping
const staticConfig = {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
};

// Serve static files with base path (for direct access)
app.use(BASE_PATH, express.static(path.join(__dirname, '../public'), staticConfig));
app.use(`${BASE_PATH}/node_modules`, express.static(path.join(__dirname, '../node_modules'), staticConfig));

// Serve static files without base path (for nginx proxy that strips the path)
app.use('/', express.static(path.join(__dirname, '../public'), staticConfig));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules'), staticConfig));

connectDB();

// API routes - serve both with and without base path to handle nginx proxy stripping
// With base path (for direct access)
app.use(`${BASE_PATH}/api/auth`, authRoutes);
app.use(`${BASE_PATH}/api/messages`, authMiddleware, messageRoutes);
app.use(`${BASE_PATH}/api/templates`, authMiddleware, templateRoutes);
app.use(`${BASE_PATH}/api/integrations`, authMiddleware, integrationRoutes);
app.use(`${BASE_PATH}/api/guidelines`, authMiddleware, guidelinesRoutes);
app.use(`${BASE_PATH}/demo`, demoRoutes);

// Without base path (for nginx proxy that strips the path)
app.use('/api/auth', authRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/guidelines', authMiddleware, guidelinesRoutes);
app.use('/demo', demoRoutes);

// Health check endpoint (both with and without base path for flexibility)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Internal Communications Assistant' });
});

app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({ status: 'OK', service: 'Internal Communications Assistant' });
});

// Base path endpoint to help frontend determine correct paths
app.get('/api/config/base-path', (req, res) => {
  const basePath = getBasePath(req);
  res.json({ basePath: basePath === '/communication-assistant' ? '' : basePath });
});

app.get(`${BASE_PATH}/api/config/base-path`, (req, res) => {
  const basePath = getBasePath(req);
  res.json({ basePath: basePath === '/communication-assistant' ? '' : basePath });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get(`${BASE_PATH}/favicon.ico`, (req, res) => {
  res.status(204).end();
});

// Catch-all handler for debugging - should be last
app.get('*', (req, res) => {
  console.log(`Unhandled route: ${req.method} ${req.path}`);
  // Since nginx strips the base path, we need to check for root path requests
  if (req.path === '/' || (!req.path.startsWith('/api') && !req.path.startsWith('/health'))) {
    // Serve index.html for SPA routes
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
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
      "script-src": ["'self'", "'unsafe-inline'"],
      "script-src-attr": ["'unsafe-inline'"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Define base path for reverse proxy
const BASE_PATH = process.env.BASE_PATH || '/communication-assistant';

// Static files with base path
app.use(BASE_PATH, express.static(path.join(__dirname, '../public')));
app.use(`${BASE_PATH}/node_modules`, express.static(path.join(__dirname, '../node_modules')));

connectDB();

// API routes with base path
app.use(`${BASE_PATH}/api/auth`, authRoutes);
app.use(`${BASE_PATH}/api/messages`, authMiddleware, messageRoutes);
app.use(`${BASE_PATH}/api/templates`, authMiddleware, templateRoutes);
app.use(`${BASE_PATH}/api/integrations`, authMiddleware, integrationRoutes);
app.use(`${BASE_PATH}/api/guidelines`, authMiddleware, guidelinesRoutes);
app.use(`${BASE_PATH}/demo`, demoRoutes);

// Health check endpoint (both with and without base path for flexibility)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Internal Communications Assistant' });
});

app.get(`${BASE_PATH}/health`, (req, res) => {
  res.json({ status: 'OK', service: 'Internal Communications Assistant' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
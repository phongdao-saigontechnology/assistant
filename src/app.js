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
app.use(express.static(path.join(__dirname, '../public')));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/guidelines', authMiddleware, guidelinesRoutes);
app.use('/demo', demoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Internal Communications Assistant' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import websiteService from '../services/websiteService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve demo website files
router.use(express.static(path.join(__dirname, '../../public/demo')));

// API endpoint to get published messages list
router.get('/api/published', async (req, res, next) => {
  try {
    const publishedMessages = await websiteService.getPublishedMessages();
    res.json({
      count: publishedMessages.length,
      messages: publishedMessages
    });
  } catch (error) {
    next(error);
  }
});

// Fallback route for demo pages - serve index.html for any unmatched demo routes
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/demo/index.html'));
});

export default router;
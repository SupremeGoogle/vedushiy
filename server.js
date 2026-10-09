import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import handlers for local emulation of serverless API
import feedbackHandler from './api/feedback.js';
import botStatusHandler from './api/bot-status.js';
import telegramHandler from './api/telegram.js';
import saveContentHandler from './api/save-content.js';
import uploadHandler from './api/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware with high limits for base64 image editing uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static site assets (extensions: /admin -> admin.html, как cleanUrls в vercel.json)
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Serverless mapping routes
app.post('/api/feedback', feedbackHandler);
app.get('/api/bot-status', botStatusHandler);
app.post('/api/telegram', telegramHandler);
app.post('/api/save-content', saveContentHandler);
app.post('/api/upload', uploadHandler);

// Fallback to index.html for index or single-page navigation
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html is not created yet');
  }
});

// 0.0.0.0 — обязательно для контейнера (Layero), иначе сервер недоступен снаружи
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[local-dev] Emulated API and static web server running at http://localhost:${PORT}`);
});

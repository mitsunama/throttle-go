import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { requireUser } from './auth.js';
import bikes from './bikes.js';
import images from './images.js';
import transactions from './transactions.js';

const app = express();
// CORS_ORIGIN: comma-separated list of allowed site URLs. Unset = allow any origin.
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '6mb' })); // bike photos arrive as base64

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/images', images); // public, so <img> tags work
app.use('/api', requireUser);
app.use('/api/bikes', bikes);
app.use('/api/transactions', transactions);

// Unknown /api routes get JSON, so the app can show a clear message.
app.use('/api', (_req, res) => res.status(404).json({ error: 'That API route doesn’t exist.' }));

// Express 5 forwards async handler errors here.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
});

process.on('unhandledRejection', (e) => console.error(e));

export default app;

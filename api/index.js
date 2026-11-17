// Vercel runs this file for every /api/* request (see the rewrite in vercel.json).
// The Express app is the handler and still sees the original path, e.g. /api/bikes/mine.
import app from '../server/src/app.js';

export default app;

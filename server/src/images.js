import { Router } from 'express';
import { query } from './db.js';

const router = Router();

// Public on purpose: <img> tags can't send the X-User-Id header.
router.get('/bikes/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).end();
  const { rows } = await query(
    'SELECT image_data, image_type FROM public.bikes WHERE id = $1',
    [req.params.id]
  );
  if (!rows[0]?.image_data) return res.status(404).end();
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.type(rows[0].image_type || 'image/jpeg').send(rows[0].image_data);
});

export default router;

import { Router } from 'express';
import { pool, query } from './db.js';
import { LISTING_SELECT } from './queries.js';

const router = Router();

const CONDITIONS = ['Good', 'Some fixes needed', 'Parts only'];
const IMAGE_PREFIX = /^data:(image\/(?:jpeg|png|webp));base64,/;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // the browser shrinks photos far below this

function validateBike(body = {}) {
  const { name, displacement, price, description, specs, image } = body;

  const cc = String(displacement ?? '').replace(/\D/g, '');
  const priceNum = Number(price);
  if (!name?.trim() || !cc || !Number.isFinite(priceNum) || priceNum < 0) {
    return { error: 'Name, displacement and a valid price are required.' };
  }

  const s = specs && typeof specs === 'object' && !Array.isArray(specs) ? specs : {};
  const cleanSpecs = {
    model_year: String(s.model_year ?? '').trim(),
    cylinder: String(s.cylinder ?? '').trim().slice(0, 30),
    condition: String(s.condition ?? '').trim(),
  };
  if (cleanSpecs.model_year && !/^\d{4}$/.test(cleanSpecs.model_year)) {
    return { error: 'Model year must be four digits, like 2019.' };
  }
  if (cleanSpecs.condition && !CONDITIONS.includes(cleanSpecs.condition)) {
    return { error: 'Pick a condition from the list.' };
  }

  let imageBuf = null;
  let imageType = null;
  if (image) {
    const m = IMAGE_PREFIX.exec(String(image));
    if (!m) return { error: 'The photo must be a JPEG, PNG or WebP image.' };
    imageBuf = Buffer.from(String(image).slice(m[0].length), 'base64');
    imageType = m[1];
    if (!imageBuf.length || imageBuf.length > MAX_IMAGE_BYTES) {
      return { error: 'That photo is too large. Try a smaller one.' };
    }
  }

  return {
    value: {
      name: name.trim(),
      cc,
      price: priceNum,
      description: description || null,
      specs: JSON.stringify(cleanSpecs),
      imageBuf,
      imageType,
    },
  };
}

// Bikes available to buy.
router.get('/', async (req, res) => {
  const { rows } = await query(
    `${LISTING_SELECT} WHERE t.status = 'Active' ORDER BY b.created_at DESC`
  );
  res.json(rows.map((r) => ({ ...r, is_mine: r.seller_id === req.userId })));
});

// Everything the current user has listed, in any status.
router.get('/mine', async (req, res) => {
  const { rows } = await query(
    `${LISTING_SELECT} WHERE t.user_id = $1 ORDER BY b.created_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

// One listing (used by the edit page).
router.get('/:id', async (req, res) => {
  const { rows } = await query(`${LISTING_SELECT} WHERE b.id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'That bike doesn’t exist.' });
  res.json({ ...rows[0], is_mine: rows[0].seller_id === req.userId });
});

// List a bike: creates the bike and its Active transaction together.
router.post('/', async (req, res) => {
  const { error, value: v } = validateBike(req.body);
  if (error) return res.status(400).json({ error });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bike = await client.query(
      `INSERT INTO public.bikes (name, displacement, price, description, specs, image_data, image_type)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7) RETURNING id`,
      [v.name, v.cc, v.price, v.description, v.specs, v.imageBuf, v.imageType]
    );
    await client.query(
      `INSERT INTO public.transactions (bike_id, user_id) VALUES ($1, $2)`,
      [bike.rows[0].id, req.userId]
    );
    await client.query('COMMIT');
    res.status(201).json({ id: bike.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// Edit a listing. Only the seller, and only while it is still Active.
// A new `image` replaces the photo; leaving it out keeps the current one.
router.patch('/:id', async (req, res) => {
  const { error, value: v } = validateBike(req.body);
  if (error) return res.status(400).json({ error });
  const { rows } = await query(
    `UPDATE public.bikes b
     SET name = $3, displacement = $4, price = $5, description = $6, specs = $7::jsonb,
         image_data = COALESCE($8::bytea, b.image_data),
         image_type = COALESCE($9::text, b.image_type)
     FROM public.transactions t
     WHERE t.bike_id = b.id AND b.id = $1 AND t.user_id = $2 AND t.status = 'Active'
     RETURNING b.id`,
    [req.params.id, req.userId, v.name, v.cc, v.price, v.description, v.specs, v.imageBuf, v.imageType]
  );
  if (!rows.length) {
    return res.status(409).json({ error: 'Only your own available listings can be edited.' });
  }
  res.json({ id: rows[0].id });
});

// Remove a listing. Only the seller, and only while it is still Active.
router.delete('/:id', async (req, res) => {
  const { rows } = await query(
    `DELETE FROM public.bikes b USING public.transactions t
     WHERE t.bike_id = b.id AND b.id = $1 AND t.user_id = $2 AND t.status = 'Active'
     RETURNING b.id`,
    [req.params.id, req.userId]
  );
  if (!rows.length) {
    return res.status(409).json({ error: 'Only your own available listings can be deleted.' });
  }
  res.status(204).end();
});

export default router;

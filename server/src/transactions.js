import { Router } from 'express';
import { query } from './db.js';
import { LISTING_SELECT } from './queries.js';

const router = Router();

// Bikes the current user has put in their cart (awaiting seller approval).
router.get('/cart', async (req, res) => {
  const { rows } = await query(
    `${LISTING_SELECT} WHERE t.buyer_id = $1 AND t.status = 'Pending' ORDER BY t.id DESC`,
    [req.userId]
  );
  res.json(rows);
});

// Buy requests waiting on the current user as seller.
router.get('/requests', async (req, res) => {
  const { rows } = await query(
    `${LISTING_SELECT} WHERE t.user_id = $1 AND t.status = 'Pending' ORDER BY t.id DESC`,
    [req.userId]
  );
  res.json(rows);
});

// Completed purchases and sales for the current user.
router.get('/history', async (req, res) => {
  const { rows } = await query(
    `${LISTING_SELECT} WHERE t.status = 'Sold' AND (t.user_id = $1 OR t.buyer_id = $1)
     ORDER BY t.bought_at DESC`,
    [req.userId]
  );
  res.json(rows);
});

// Each step is a single guarded UPDATE, so two people can't claim the same bike.
async function transition(res, sql, params, failMessage) {
  const { rows } = await query(sql, params);
  if (!rows.length) return res.status(409).json({ error: failMessage });
  res.json(rows[0]);
}

// Buyer adds an Active bike to the cart.
router.post('/:id/cart', (req, res) =>
  transition(
    res,
    `UPDATE public.transactions SET status = 'Pending', buyer_id = $2
     WHERE id = $1 AND status = 'Active' AND user_id <> $2 RETURNING *`,
    [req.params.id, req.userId],
    'This bike is no longer available, or it is your own listing.'
  )
);

// Buyer removes the bike from their cart.
router.post('/:id/cancel', (req, res) =>
  transition(
    res,
    `UPDATE public.transactions SET status = 'Active', buyer_id = NULL
     WHERE id = $1 AND status = 'Pending' AND buyer_id = $2 RETURNING *`,
    [req.params.id, req.userId],
    'Nothing to remove from your cart.'
  )
);

// Seller approves: the bike is sold and bought_at is stamped.
router.post('/:id/approve', (req, res) =>
  transition(
    res,
    `UPDATE public.transactions SET status = 'Sold', bought_at = NOW()
     WHERE id = $1 AND status = 'Pending' AND user_id = $2 RETURNING *`,
    [req.params.id, req.userId],
    'There is no pending request to approve.'
  )
);

// Seller declines: the bike goes back on sale.
router.post('/:id/reject', (req, res) =>
  transition(
    res,
    `UPDATE public.transactions SET status = 'Active', buyer_id = NULL
     WHERE id = $1 AND status = 'Pending' AND user_id = $2 RETURNING *`,
    [req.params.id, req.userId],
    'There is no pending request to decline.'
  )
);

export default router;

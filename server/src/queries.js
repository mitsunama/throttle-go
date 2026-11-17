// A listing = a bike joined with its transaction row.
// image_data (the uploaded photo) is deliberately NOT selected here; it is served
// by GET /api/images/bikes/:id. The ?v= part changes when the bike is updated, so
// browsers can cache the photo forever and still pick up a new one.
export const LISTING_SELECT = `
  SELECT b.id, b.name, b.displacement, b.price, b.description, b.specs,
         CASE WHEN b.image_data IS NOT NULL
              THEN '/api/images/bikes/' || b.id || '?v=' || EXTRACT(EPOCH FROM b.updated_at)::bigint
              ELSE b.image_url END AS image_url,
         b.created_at,
         t.id AS transaction_id, t.user_id AS seller_id, t.buyer_id,
         t.status, t.bought_at
  FROM public.transactions t
  JOIN public.bikes b ON b.id = t.bike_id`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// No authentication. The client sends its anonymous UUID in `X-User-Id`;
// the API validates the format and uses it as user_id / buyer_id.
export function requireUser(req, res, next) {
  const id = req.get('x-user-id');
  if (!UUID_RE.test(id || '')) {
    return res.status(400).json({ error: 'Missing or invalid X-User-Id header.' });
  }
  req.userId = id.toLowerCase();
  next();
}

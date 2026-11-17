import { getUserIdentifier } from '../services/userService';

// Empty = same site (Vercel, and the Vite dev proxy). Set VITE_API_URL only for a separate API host.
const BASE = import.meta.env.VITE_API_URL || '';

// Photos uploaded through the app are served by the API (/api/images/bikes/12?v=...),
// so those get the API address in front. Older rows keep whatever link they had:
// full URLs are used as they are, and site paths like /images/x.jpg or images/x.jpg
// load from the web app's own public/ folder.
const UPLOADED = '/api/images/bikes/';
export const assetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith(UPLOADED)) return `${BASE}${path}`;
  if (/^(https?:|data:|blob:|\/)/i.test(path)) return path;
  return `/${path}`;
};

// Every request carries the browser's anonymous UUID. The API uses it as
// transactions.user_id / buyer_id. No login, no token.
export async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-User-Id': getUserIdentifier() },
    });
  } catch {
    throw new Error('Can’t reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Something went wrong (error ${res.status}). Try again.`);
  return data;
}

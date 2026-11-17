import 'dotenv/config';
import pg from 'pg';

const url = process.env.DATABASE_URL || '';
const isLocal = /localhost|127\.0\.0\.1/.test(url);

// Hosted Postgres needs TLS. Set DATABASE_SSL=false to turn it off.
const ssl = isLocal || process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false };

export const pool = new pg.Pool({ connectionString: url, ssl, max: Number(process.env.DB_POOL_MAX || 3) });
export const query = (text, params) => pool.query(text, params);

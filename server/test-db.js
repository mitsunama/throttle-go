//remove when success

import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

try {
  const result = await pool.query(
    'SELECT current_user, current_database(), NOW()'
  );

  console.log('Connection successful!');
  console.log(result.rows[0]);
} catch (error) {
  console.error('Connection failed:', error.code, error.message);
} finally {
  await pool.end();
}

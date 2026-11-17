// FRESH databases only. If the tables already exist, use db/existing-database.sql instead.
import { readFileSync } from 'node:fs';
import { pool } from './db.js';

const sql = readFileSync(new URL('../../db/schema.sql', import.meta.url), 'utf8');
await pool.query(sql);
console.log('Schema applied.');
await pool.end();

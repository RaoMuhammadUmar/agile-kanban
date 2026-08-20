import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Keep the pool small for a portfolio deployment.
  max: 10,

  // Don't wait indefinitely for a database connection.
  connectionTimeoutMillis: 5000,

  // Close idle connections after 30 seconds.
  idleTimeoutMillis: 30000,

  // Supabase Postgres connection.
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client:', err);
});

export default pool;
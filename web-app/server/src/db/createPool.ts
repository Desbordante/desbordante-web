import { Pool } from "pg";

async function createPool() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT!),
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    throw err;
  });

  return pool;
}

export = createPool;

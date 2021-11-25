const { Pool } = require("pg");

async function createPool() {
  // pools uses environment variables
  // for connection information
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  // the pool will emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    throw err;
  });

  return pool;
}

module.exports = createPool;

const { Pool } = require("pg");

const isLocal = process.env.PGHOST === "localhost" || process.env.PGHOST === "127.0.0.1" || !process.env.PGHOST;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PGHOST || "localhost",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "skillswap",
      port: process.env.PGPORT || 5432,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });

async function initDb() {
  let client;
  try {
    client = await pool.connect();
    console.log("Connected to PostgreSQL successfully!");

    // Create USERS Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        skills_offered TEXT[] DEFAULT '{}',
        skills_wanted TEXT[] DEFAULT '{}',
        bio TEXT DEFAULT '',
        profile_pic VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        credit_points INTEGER DEFAULT 10,
        rating DECIMAL(3, 2) DEFAULT 5.00,
        badge VARCHAR(50) DEFAULT 'LEARNER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table verified.");

    // Create CONNECTIONS Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'connected',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_pair UNIQUE (user1_id, user2_id)
      );
    `);
    console.log("Connections table verified.");

    // Create MESSAGES Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Messages table verified.");

  } catch (err) {
    console.error("Database connection or initialization failed:", err.message);
    throw err; // Fail fast without mock simulation
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  pool,
  initDb,
  query: (text, params) => pool.query(text, params),
};

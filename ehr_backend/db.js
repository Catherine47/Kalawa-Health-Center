// db.js - SUPPORTS BOTH LOCAL & RENDER
import pkg from "pg";
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// ✅ SMART CONFIG: Uses Render DATABASE_URL if available, otherwise localhost
const poolConfig = process.env.DATABASE_URL 
  ? {
      // ✅ PRODUCTION (Render)
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // REQUIRED for Render
    }
  : {
      // ✅ DEVELOPMENT (Local)
      user: "postgres",
      host: "localhost",
      database: "ehr_system",
      password: "30554106",
      port: 5432,
    };

// Add common pool settings
Object.assign(poolConfig, {
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const pool = new Pool(poolConfig);

// Test function
export const testDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    const env = process.env.DATABASE_URL ? "PRODUCTION" : "LOCAL";
    console.log(`✅ Database connected (${env}):`, res.rows[0]);
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
};

export { pool };
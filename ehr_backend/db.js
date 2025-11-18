// db.js
import pkg from "pg";
const { Pool } = pkg;

// ✅ Create a single shared connection pool
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ehr_system",
  password: "30554106", // ← if you use a password, put it here
  port: 5432,
  max: 10, // limit to 10 connections (safe for most apps)
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 5000, // timeout if can't connect within 5s
});

// ✅ Simple function to test the connection
export const testDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
};

// ✅ Export shared pool
export { pool };







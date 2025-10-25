// db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ehr_system',
  password: '30554106',
  port: 5432,
});

export { pool }; // ✅ named export







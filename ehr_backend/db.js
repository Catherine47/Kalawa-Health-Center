const { Pool } = require('pg');

// create a new connection pool
const pool = new Pool({
  user: 'postgres',        
  host: 'localhost',
  database: 'ehr_system',      
  password: '30554106', 
  port: 5432,              
});

module.exports = pool;


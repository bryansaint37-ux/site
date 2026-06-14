const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'worldcup_tickets',
  user: 'postgres',
  password: 'postgres',
  connectionTimeoutMillis: 10000,
});
pool.query('select 1 as ok')
  .then((res) => {
    console.log('OK', res.rows[0]);
  })
  .catch((err) => {
    console.error('ERR', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

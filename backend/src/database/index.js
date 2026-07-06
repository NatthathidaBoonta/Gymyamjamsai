/**
 * src/database/index.js
 *
 * MySQL Connection Pool Singleton (mysql2/promise)
 *
 * ใช้รูปแบบ Singleton เพื่อไม่ให้สร้าง connection pool ใหม่ทุกครั้งที่ import
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

module.exports = pool;

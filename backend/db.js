// Import required packages
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db_name = process.env.DB_NAME;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;
const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;

const pool = mysql.createConnection({ // Set your own connection limit
    host: db_host,
    user: db_user,
    password: db_password,
    database: db_name,
    port: db_port
});

pool.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

module.exports = pool;
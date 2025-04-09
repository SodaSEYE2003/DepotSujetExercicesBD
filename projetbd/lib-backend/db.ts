import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: true
  }
});

export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.query(sql, values);
  return Array.isArray(rows) ? rows[0] : rows;
}
import mysql from "mysql2/promise";
import { createPool } from 'mysql2/promise';
import { unstable_noStore as noStore } from 'next/cache';
// Vérification côté serveur
if (typeof window !== 'undefined') {
  throw new Error('⚠️ MySQL ne peut pas être utilisé côté client');
}
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '', // Mot de passe
  database: process.env.DB_NAME || 'correction',
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10
});

export async function getServerSideUser(email: string) {
  noStore(); // Désactive le cache
  const [rows] = await pool.query(
    "SELECT id, email, password, role FROM comptes WHERE email = ?", 
    [email]
  );
  return rows;
}


// import mysql from 'mysql2/promise';

// const pool = mysql.createPool({
//     host: process.env.DB_HOST || "localhost",
//     user: process.env.DB_USER || "root",
//     password: process.env.DB_PASSWORD || "",
//     database: process.env.DB_NAME || "ballet_evoting_schema",
//     waitForConnections: true,
// });

// export async function query({ query, values = [] }) {
//     const [results] = await pool.execute(query, values);
//     return results;
// }

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export async function getDBConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ballet_evoting_schema",
    });

    console.log("✅ Database Connected Successfully");
    return connection;
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    throw new Error("Database Connection Error");
  }
}
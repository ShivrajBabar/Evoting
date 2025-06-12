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
      host: "193.203.184.92",
      user: "u906396894_evotingShivraj",
      password: "Rajendrababar@123",
      database: "u906396894_evotingShivraj",
    });

    // const connection = await mysql.createConnection({
    //   host: process.env.DB_HOST || "193.203.184.92",
    //   user: process.env.DB_USER || "u906396894_evotingShivraj",
    //   password: process.env.DB_PASSWORD || "Rajendrababar@123",
    //   database: process.env.DB_NAME || "u906396894_evotingShivraj",
    // });

    console.log("✅ Database Connected Successfully");
    return connection;
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    throw new Error("Database Connection Error");
  }
}
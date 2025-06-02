import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: path.resolve('src/database/database.db'),
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function query({ query, params = [] }) {
  const database = await openDb();
  return database.all(query, params);
}

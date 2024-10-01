import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database and ensure tables exist
export async function openDB() {
  const db = await open({
    filename: './votes.db',
    driver: sqlite3.Database,
  });

  // Ensure the "votes" table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vote TEXT
    )
  `);

  // Create a table to store voting status if it doesn't already exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS voting_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      is_active INTEGER,
      time_remaining INTEGER
    )
  `);

  return db;
}

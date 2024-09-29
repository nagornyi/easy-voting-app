import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Function to open the database and ensure tables exist
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

  // Ensure the "voting_status" table exists to track whether voting is active
  await db.exec(`
    CREATE TABLE IF NOT EXISTS voting_status (
      id INTEGER PRIMARY KEY,
      is_active INTEGER
    )
  `);

  // Insert initial voting status if not exists
  const status = await db.get('SELECT * FROM voting_status');
  if (!status) {
    await db.run('INSERT INTO voting_status (is_active) VALUES (0)'); // 0 means voting is inactive
  }

  return db;
}

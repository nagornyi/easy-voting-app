import { openDB } from './db';
import { notifyClients } from './socket';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Create the table if it doesn't exist and reset votes
      await db.exec(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          vote TEXT
        );
        DELETE FROM votes;  -- Reset the votes
      `);
      
      // Set voting status to active (1)
      await db.run('UPDATE voting_status SET is_active = 1 WHERE id = 1');

      // Notify all connected clients
      notifyClients({ type: 'VOTING_STARTED' });

      res.status(200).json({ message: 'Voting started' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to start voting' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

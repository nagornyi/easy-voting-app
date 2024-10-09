import { openDB, setVotingNumber, deleteAllVotes } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Reset voting number
      await setVotingNumber(db, 0, "newsession");

      // Delete all votes
      await deleteAllVotes(db);

      res.status(200).json({ message: 'New session of the parliament opened' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to open a new session of the parliament' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

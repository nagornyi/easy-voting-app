import { openDB, deleteAllVotes } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Delete all votes
      await deleteAllVotes(db);    

      res.status(200).json({ message: 'All votes have been reset' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to reset votes' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

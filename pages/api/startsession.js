import { openDB, setVoteType, setVotingNumber, deleteAllVotes } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Delete all votes
      await deleteAllVotes(db);

      // Set vote type ("single-motion" or "text-to-vote")
      // default to "single-motion" if not provided
      if (!req.body.vote_type || (req.body.vote_type !== 'single-motion' && req.body.vote_type !== 'text-to-vote')) {
        req.body.vote_type = 'single-motion';
      }
      const { vote_type } = req.body;      
      await setVoteType(db, vote_type);

      // Reset voting number
      await setVotingNumber(db, 0, "newsession");      

      res.status(200).json({ message: 'New session of the parliament opened' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to open a new session of the parliament' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

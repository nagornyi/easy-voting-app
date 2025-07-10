import { openDB, setVoteType, setVotingNumber, deleteAllVotes } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Delete all votes
      await deleteAllVotes(db);

      // Set vote type ("single-motion" or "text-to-vote")
      // default to "single-motion" if not provided
      let vote_type = req.body.vote_type;
      if (!vote_type || (vote_type !== 'single-motion' && vote_type !== 'text-to-vote')) {
        vote_type = 'single-motion';
      }
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

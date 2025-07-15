import { openDB, setVoteType, setVotingInfo, deleteAllVotes, deleteCodesToNames } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Delete all votes
      await deleteAllVotes(db);

      // Always remove old codes_to_names from voting_info
      await deleteCodesToNames(db);

      // Set vote type ("single-motion" or "text-to-vote")
      // default to "single-motion" if not provided
      let vote_type = req.body.vote_type;
      if (!vote_type || (vote_type !== 'single-motion' && vote_type !== 'text-to-vote')) {
        vote_type = 'single-motion';
      }
      await setVoteType(db, vote_type);

      // Accept optional codes_to_names from request body
      const { codes_to_names } = req.body;

      // Reset voting number and optionally store codes_to_names
      await setVotingInfo(db, 0, "newsession", codes_to_names);

      res.status(200).json({ message: `New session of the parliament opened with '${vote_type}' vote type` });
    } catch (err) {
      res.status(500).json({ message: 'Failed to open a new session of the parliament' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

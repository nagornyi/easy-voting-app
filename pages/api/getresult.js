import { openDB, getVotes, getVoteType } from '@/src/db';
import { processVotes } from '@/src/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();

    // Get all votes from the database
    const votes = await getVotes(db);

    // Get the vote type to determine how to process votes
    const { vote_type } = await getVoteType(db);

    // Process votes based on the vote type
    const results = await processVotes(votes, vote_type);

    res.status(200).json(results);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

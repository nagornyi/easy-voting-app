import { openDB, getVoteType, getVotingStatus, getRecessStatus, getVotes, getVotingNumber } from '@/src/db';
import { processVotes } from '@/src/utils';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { is_active, time_remaining } = await getVotingStatus(db);
    const { is_onrecess } = await getRecessStatus(db);
    const { voting_number } = await getVotingNumber(db);

    // Fetch all votes from the database
    const votes = await getVotes(db);
    
    // Get the vote type to determine how to process votes
    const { vote_type } = await getVoteType(db);

    // Process votes based on the vote type
    const results = await processVotes(votes, vote_type);

    res.status(200).json({ is_active, time_remaining, is_onrecess, voting_number, vote_type, "results": results });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

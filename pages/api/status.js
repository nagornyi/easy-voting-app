import { openDB, getVotingStatus, getRecessStatus, getVotes, getVotingNumber } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { is_active, time_remaining } = await getVotingStatus(db);
    const { is_onrecess } = await getRecessStatus(db);
    const { voting_number } = await getVotingNumber(db);
    const votes = await getVotes(db);

    const results = {
      yes: 0,
      abstain: 0,
      no: 0
    };

    votes.forEach((vote) => {
      if (results[vote] !== undefined) {
        results[vote] += 1; // Increment the count for the vote
      }
    });

    res.status(200).json({ is_active, time_remaining, is_onrecess, voting_number, "results": results });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

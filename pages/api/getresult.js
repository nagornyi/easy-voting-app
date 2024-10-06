import { openDB, getVotes } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
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

    res.status(200).json(results);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

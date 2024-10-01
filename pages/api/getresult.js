import { openDB } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const votes = await db.all('SELECT vote, COUNT(*) as count FROM votes GROUP BY vote');
    
    const results = {
      yes: 0,
      abstain: 0,
      no: 0
    };

    votes.forEach(({ vote, count }) => {
      results[vote] = count;
    });

    res.status(200).json(results);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

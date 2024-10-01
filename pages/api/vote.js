import { openDB } from '../../src/db';
import { getVotingStatus } from '../../src/votingmanager';

export default async function handler(req, res) {
  const { is_active } = await getVotingStatus();

  if (is_active !== 1) {
      res.status(403).json({ message: 'Voting is not active' });
      return;
  }
  
  if (req.method === 'POST') {
    const { vote } = req.body;

    if (!['yes', 'abstain', 'no'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote' });
    }

    try {
      const db = await openDB();
      await db.run('INSERT INTO votes (vote) VALUES (?)', vote);
      res.status(200).json({ message: 'Vote recorded' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to record vote' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

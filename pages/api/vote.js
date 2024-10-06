import { openDB, getVotingStatus, storeVote } from '../../src/db';

export default async function handler(req, res) {
  const db = await openDB();
  const { is_active } = await getVotingStatus(db);

  if (!is_active) {
      res.status(403).json({ message: 'Voting is not active' });
      return;
  }
  
  if (req.method === 'POST') {
    const { vote } = req.body;

    if (!['yes', 'abstain', 'no'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote' });
    }

    try {
      await storeVote(db, vote);
      res.status(200).json({ message: 'Vote recorded' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to record vote' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

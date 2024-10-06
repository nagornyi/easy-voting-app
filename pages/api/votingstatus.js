import { openDB, getVotingStatus } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { is_active, time_remaining } = await getVotingStatus(db);
    res.json({ is_active, time_remaining });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

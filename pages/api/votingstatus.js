import { openDB, getVotingStatus, getVotingNumber } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { is_active, time_remaining } = await getVotingStatus(db);
    const { voting_number, voting_id } = await getVotingNumber(db);
    res.status(200).json({ is_active, time_remaining, voting_number, voting_id });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

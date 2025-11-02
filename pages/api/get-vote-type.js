import { openDB, getVoteType } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { vote_type } = await getVoteType(db);
    
    res.status(200).json({ vote_type });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

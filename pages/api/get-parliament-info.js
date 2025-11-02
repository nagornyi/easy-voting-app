import { openDB, getParliamentInfo } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { parliament_name } = await getParliamentInfo(db);
    
    res.status(200).json({ parliament_name });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

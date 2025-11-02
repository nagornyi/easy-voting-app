import { openDB, setParliamentInfo } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      const { parliament_name } = req.body;      
      await setParliamentInfo(db, parliament_name);
      
      res.status(200).json({ message: `Parliament information has been changed` });
    } catch (err) {
      res.status(500).json({ message: 'Failed to change parliament information' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

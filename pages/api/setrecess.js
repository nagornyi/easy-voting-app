import { openDB, setRecessStatus } from '@/src/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();

      const { status } = req.body;
      const recessStatus = status;
    
      await setRecessStatus(db, recessStatus);
      
      res.status(200).json({ message: `Recess status changed to: ${recessStatus}` });
    } catch (err) {
      res.status(500).json({ message: 'Failed to change recess status' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

import { openDB, getRecessStatus } from '../../src/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const db = await openDB();
    const { is_onrecess } = await getRecessStatus(db);
    res.json({ is_onrecess });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

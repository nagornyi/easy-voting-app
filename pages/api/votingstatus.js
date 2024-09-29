import { openDB } from './db';

export default async function handler(req, res) {
  try {
    const db = await openDB();
    const status = await db.get('SELECT is_active FROM voting_status WHERE id = 1');
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve voting status' });
  }
}

import { openDB, deleteAllVotes, getVotingNumber, setVotingNumber } from '../../src/db';
import { startVote } from '../../src/votingmanager';
const defaultTimerDuration = 10;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Delete all votes
      await deleteAllVotes(db);

      // Get voting number
      const { voting_number } = await getVotingNumber(db);
      const votingNumber = voting_number + 1;

      // Increment voting number
      await setVotingNumber(db, votingNumber);
      
      // Get duration from request body or set default duration
      const { duration } = req.body;
      const timerDuration = duration ? parseInt(duration) : defaultTimerDuration;
      await startVote(timerDuration); // Start the voting and timer

      res.status(200).json({ message: 'Voting started' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to start voting' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

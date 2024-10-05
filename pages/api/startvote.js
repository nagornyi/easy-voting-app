import { openDB } from '../../src/db';
import { startVote } from '../../src/votingmanager';
import { updateVotingResults } from './graphql';
const defaultTimerDuration = 10;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await openDB();
      
      // Reset votes
      await db.exec(`
        DELETE FROM votes;  -- Reset the votes
      `);
      
      // Get duration from request body or set default duration
      const { duration } = req.body;
      const timerDuration = duration ? parseInt(duration) : defaultTimerDuration;
      await startVote(timerDuration); // Start the voting and timer
      const vote = {"yes":0,"no":0,"abstain":0,"total":0,"decision":"РІШЕННЯ НЕ ПРИЙНЯТО"};
      await updateVotingResults(JSON.stringify(vote));

      res.status(200).json({ message: 'Voting started' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to start voting' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

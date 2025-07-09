import { openDB, deleteAllVotes, getVotingNumber, setVotingNumber } from '@/src/db';
import { startVote } from '@/src/votingmanager';
const defaultTimerDuration = 10;

export default async function handler(req, res) {
  function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  if (req.method === 'POST') {
    try {
      const db = await openDB();            

      // Get timer duration from request body or set default duration
      const { duration } = req.body;
      const timerDuration = duration ? parseInt(duration) : defaultTimerDuration;

      // Get last voting number and increment it
      const { voting_number } = await getVotingNumber(db);      
      const votingNumber = voting_number + 1;

      // Generate unique ID for the current voting
      const votingID = makeid(8);

      // Delete all votes
      await deleteAllVotes(db);      
      // Save new voting number
      await setVotingNumber(db, votingNumber, votingID);      
      await startVote(timerDuration); // Start the voting and timer

      res.status(200).json({ message: 'Voting started' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to start voting' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

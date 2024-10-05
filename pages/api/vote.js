import { openDB } from '../../src/db';
import { getVotingStatus } from '../../src/votingmanager';
import { updateVotingResults } from './graphql';

export default async function handler(req, res) {
  const { is_active } = await getVotingStatus();

  if (is_active !== 1) {
      res.status(403).json({ message: 'Voting is not active' });
      return;
  }
  
  if (req.method === 'POST') {
    const { vote } = req.body;

    if (!['yes', 'abstain', 'no'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote' });
    }

    try {
      const db = await openDB();
      await db.run('INSERT INTO votes (vote) VALUES (?)', vote);
      res.status(200).json({ message: 'Vote recorded' });
      let updtVote = null;
      if (vote == 'yes') {
        updtVote = {"yes":1,"no":0,"abstain":0,"total":0,"decision":"РІШЕННЯ НЕ ПРИЙНЯТО"};
      }
      if (vote == 'no') {
        updtVote = {"yes":0,"no":1,"abstain":0,"total":0,"decision":"РІШЕННЯ НЕ ПРИЙНЯТО"};
      }
      if (vote == 'abstain') {
        updtVote = {"yes":0,"no":0,"abstain":1,"total":0,"decision":"РІШЕННЯ НЕ ПРИЙНЯТО"};
      }
      await updateVotingResults(updtVote);
    } catch (err) {
      res.status(500).json({ message: 'Failed to record vote' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

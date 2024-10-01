import { getVotingStatus } from '../../src/votingmanager';

export default async function handler(req, res) {
  const { is_active, time_remaining } = await getVotingStatus();  
  res.json({ is_active, time_remaining });
}

export async function processVotes(votes, voteType) {
  let results = {};
  
  // Use the vote type to determine how to process votes
  if (voteType === 'single-motion') {
    // Initialize results based on vote type
    results = {
      yes: 0,
      abstain: 0,
      no: 0
    };
    votes.forEach((vote) => {
      if (results[vote] !== undefined) {
        results[vote] += 1; // Increment the count for the vote
      }
    });
  } else if (voteType === 'text-to-vote') {
    // For text-to-vote, we assume votes are stored as strings
    votes.forEach((vote) => {
      if (results[vote]) {
        results[vote] += 1; // Increment the count for the vote
      } else {
        results[vote] = 1; // Initialize the count for this vote
      }
    });
  } else {
    return res.status(400).json({ message: 'Vote type not supported' });
  }

  return results;
}
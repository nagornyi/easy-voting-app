let votes = { yes: 0, abstain: 0, no: 0 };

export function resetVotes() {
  votes = { yes: 0, abstain: 0, no: 0 };
}

export function getVotes() {
  return votes;
}

export function updateVote(vote) {
  if (vote === 'yes') votes.yes++;
  if (vote === 'abstain') votes.abstain++;
  if (vote === 'no') votes.no++;
}

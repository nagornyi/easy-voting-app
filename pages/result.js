import { gql, useSubscription } from '@apollo/client';

const VOTING_UPDATED = gql`
  subscription VotingUpdated {
    votingUpdated {
      yes
      no
      abstain
      total
      decision
    }
  }
`;

const VotingResults = () => {
  const { data, loading, error } = useSubscription(VOTING_UPDATED);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  console.log(data);

  const { yes, no, abstain, total, decision } = data?.votingUpdated || {};

  return (
    <div>
      <p>Yes: {yes}</p>
      <p>No: {no}</p>
      <p>Abstain: {abstain}</p>
      <p>Total: {total}</p>
      <p>Decision: {decision}</p>
    </div>
  );
};

export default VotingResults;

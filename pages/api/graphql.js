import { ApolloServer, gql } from 'apollo-server-micro';
import { PubSub } from 'graphql-subscriptions';

// Create a PubSub instance
const pubsub = new PubSub();

// Define your GraphQL schema
const typeDefs = gql`
  type VotingResult {
    yes: Int
    no: Int
    abstain: Int
    total: Int
    decision: String
  }

  type Query {
    getVotingResults: VotingResult
  }

  type Subscription {
    votingUpdated: VotingResult
  }
`;

// Sample data (replace with your actual data source)
let votingResults = {
  yes: 0,
  no: 0,
  abstain: 0,
  total: 0,
  decision: 'РІШЕННЯ НЕ ПРИЙНЯТО',
};

// Define your resolvers
const resolvers = {
  Query: {
    getVotingResults: () => votingResults,
  },
  Subscription: {
    votingUpdated: {
      subscribe: () => {
        // Initialize with default data if needed
        if (!votingResults) {
          votingResults = {
            yes: 0,
            no: 0,
            abstain: 0,
            total: 0,
            decision: 'РІШЕННЯ НЕ ПРИЙНЯТО',
          };
        }
        return pubsub.asyncIterator(['VOTING_UPDATED']);
      },
    },
  },
};

// Function to update voting results and publish the update
export async function updateVotingResults(newVote) {
  // Update the results based on the new vote
  votingResults = {
    ...votingResults,
    yes: votingResults.yes + newVote.yes,
    no: votingResults.no + newVote.no,
    abstain: votingResults.abstain + newVote.abstain,
  };
  votingResults.total = votingResults.yes + votingResults.no + votingResults.abstain;
  votingResults.decision = votingResults.yes > votingResults.no ? 'РІШЕННЯ ПРИЙНЯТО' : 'РІШЕННЯ НЕ ПРИЙНЯТО';

  console.log("VOTING STATUS IS UPDATING... "+JSON.stringify({ votingUpdated: votingResults }));
  // Publish the new results to all subscribers
  await pubsub.publish('VOTING_UPDATED', { votingUpdated: votingResults });
}

// Create Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    pubsub,
  }),
});

await apolloServer.start();

// Export the server as a microservice
export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: '/api/graphql' });

const express = require('express');
const next = require('next');
const http = require('http');
const { ApolloServer, gql } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Create a PubSub instance
const pubsub = new PubSub();

app.prepare().then(async () => {
  const server = express();
  const httpServer = http.createServer(server);
  
  // GraphQL type definitions
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
        subscribe: () => pubsub.asyncIterator(['VOTING_UPDATED']),
      },
    },
  };

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      pubsub,
    }),
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply middleware to connect Apollo Server with Express
  apolloServer.applyMiddleware({ app: server, path: '/api/graphql' });

  // Set up a route for your Next.js app
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
});

import { createClient } from 'redis';

let redisClient;

export async function openDB() {
  if (!redisClient) {
    // Check if the environment is production
    if (process.env.NODE_ENV === 'production') {
      // Redis URL for production
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'; // Fallback to local for development
      redisClient = createClient({ url: redisUrl });
    } else {
      // Use a local Redis instance or handle dev scenario
      redisClient = createClient({ url: 'redis://localhost:6379' }); // Adjust as needed for your local setup
    }

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await redisClient.connect();
  }

  return redisClient;
}

// Store a vote
export async function storeVote(client, vote) {
  const id = await client.incr('vote_id'); // Increment the vote ID
  await client.hSet(`vote:${id}`, { id, vote });
}

// Get all votes
export async function getVotes(client) {
  const keys = await client.keys('vote:*'); // Get all keys for votes
  const votes = [];

  for (const key of keys) {
    const voteData = await client.hGetAll(key); // Get each vote from Redis
    votes.push(voteData.vote);
  }

  return votes; // Return an array of all votes
}

// Set voting status
export async function setVotingStatus(client, isActive, timeRemaining) {
  await client.hSet('voting_status', { is_active: isActive ? 1 : 0, time_remaining: timeRemaining });
}

// Get voting status
export async function getVotingStatus(client) {
  const status = await client.hGetAll('voting_status');

  // Check if status is empty, meaning voting_status is not set
  if (Object.keys(status).length === 0) {
    return {
      is_active: false, // Default value
      time_remaining: 0 // Default value
    };
  }

  return {
    is_active: status.is_active === '1', // Convert "1" to true and "0" to false
    time_remaining: parseInt(status.time_remaining, 10) || 0 // Convert time_remaining to integer
  };
}

// Set recess status (a break during the parliamentary session)
export async function setRecessStatus(client, isOnRecess) {
  await client.hSet('recess_status', { is_onrecess: isOnRecess ? 1 : 0 });
}

// Get recess status (a break during the parliamentary session)
export async function getRecessStatus(client) {
  const status = await client.hGetAll('recess_status');

  // Check if status is empty, meaning voting_status is not set
  if (Object.keys(status).length === 0) {
    return {
      is_onrecess: false // Default value
    };
  }

  return {
    is_onrecess: status.is_onrecess === '1', // Convert "1" to true and "0" to false    
  };
}

// Set voting number and unique ID
export async function setVotingNumber(client, votingNumber, votingID) {
  await client.hSet('voting_number', { voting_number: votingNumber, voting_id: votingID } );
}

// Get voting number
export async function getVotingNumber(client) {
  const votingNumber = await client.hGetAll('voting_number');

  // Check if voting number is empty, meaning it's the first voting of the session
  if (Object.keys(votingNumber).length === 0) {
    return {
      voting_number: 0, // Default value
      voting_id: "default"
    };
  }

  return {
    voting_number: parseInt(votingNumber.voting_number, 10) || 0, // Convert voting_number to integer
    voting_id: votingNumber.voting_id
  };
}

export async function deleteAllVotes(client) {
  // Get all keys that match the "vote:*" pattern
  const keys = await client.keys('vote:*');
  
  if (keys.length > 0) {
    // Delete all matching keys (votes)
    await client.del(keys);
    console.log('All votes have been deleted.');
  } else {
    console.log('No votes to delete.');
  }
}

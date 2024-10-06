import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const voters = __ENV.VOTERS || 10; // Default to 10 users
const hostname = __ENV.HOSTNAME || 'http://localhost:3000';

// Polling for voting status every second
export const options = {
  stages: [
    { duration: '30s', target: voters },  // Stage 1: Polling
    { duration: '1s', target: 1 },        // Stage 2: Admin starts the vote
    { duration: '10s', target: voters },  // Stage 3: Voting
    { duration: '1s', target: 1 },        // Stage 4: Admin gets results
  ],
};

export default function () {
  const stage = __ITER;  // Get the current iteration

  if (stage < voters) {
    // Stage 1: Polling for voting status every second
    const res = http.get(`${hostname}/api/votingstatus`);
    check(res, {
      'Polling status is 200': (r) => r.status === 200,
    });
    sleep(1);
  } else if (stage === voters) {
    // Stage 2: Admin starts the vote (Single request)
    const res = http.post(`${hostname}/api/startvote`);
    check(res, {
      'Start vote response is 200': (r) => r.status === 200,
    });
  } else if (stage > voters && stage <= voters * 2) {
    // Stage 3: Voting - Each user votes after a random sleep and then polls status
    const randomSleep = Math.floor(Math.random() * 7) + 2;  // Random sleep between 2 and 9 seconds
    sleep(randomSleep);

    const vote = Math.random() < 0.5 ? 'yes' : 'no';  // Random vote
    const resVote = http.post(`${hostname}/api/vote`, { vote });
    check(resVote, {
      'Vote response is 200': (r) => r.status === 200,
    });

    // Immediately start polling again after voting
    const resPoll = http.get(`${hostname}/api/votingstatus`);
    check(resPoll, {
      'Polling status after vote is 200': (r) => r.status === 200,
    });
    sleep(1);
  } else if (stage > voters * 2) {
    // Stage 4: Admin gets the result
    const res = http.get(`${hostname}/api/getresult`);
    const totalVotes = res.json().yes + res.json().no + res.json().abstain;
    check(res, {
      'Get result response is 200': (r) => r.status === 200,
      'Total votes match the number of voters': () => totalVotes === voters,
    });
  }
}

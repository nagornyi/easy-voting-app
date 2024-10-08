import http from 'k6/http';
import { sleep, check } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const HOSTNAME = __ENV.HOSTNAME || 'http://localhost:3000';
const VOTERS = parseInt(__ENV.VOTERS) || 10;

export const options = {
  scenarios: {
    polling: {
      executor: 'constant-vus',
      vus: VOTERS,
      duration: '30s',
      startTime: '0s',      
      exec: 'polling',  // Specify the function to run
    },
    startVote: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      startTime: '30s',      
      exec: 'startVote',  // Specify the function to run
    },
    voting: {
      executor: 'constant-vus',
      vus: VOTERS,
      duration: '10s',
      startTime: '31s',      
      exec: 'voting',  // Specify the function to run
    },
    getResult: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      startTime: '41s',      
      exec: 'getResult',  // Specify the function to run
    },
  },
};

export function polling() {
  const res = http.get(`${HOSTNAME}/api/votingstatus`);
  check(res, { 'GET /api/votingstatus status is 200': (r) => r.status === 200 });
  sleep(0.5);
}

export function startVote() {
  const res = http.post(`${HOSTNAME}/api/startvote`);
  check(res, { 'POST /api/startvote status is 200': (r) => r.status === 200 });
}

export function voting() {
  let hasVoted = false;
  const min = 2;
  const max = 8;
  const voteTime = Math.random() * (max - min) + min; // Random time within 10 seconds

  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < 10000) { // Run for 10 seconds
    if (!hasVoted && (new Date().getTime() - startTime) > voteTime * 1000) {
      // Time to vote
      const vote = randomItem(['yes', 'no', 'abstain']);
      const voteRes = http.post(`${HOSTNAME}/api/vote`, JSON.stringify({ vote }), {
        headers: { 'Content-Type': 'application/json' },
      });
      check(voteRes, { 'POST /api/vote status is 200': (r) => r.status === 200 });
      hasVoted = true;
    }

    // Continue polling
    const statusRes = http.get(`${HOSTNAME}/api/votingstatus`);
    check(statusRes, { 'GET /api/votingstatus status is 200': (r) => r.status === 200 });
    sleep(0.5);
  }
}

export function getResult() {
  const res = http.get(`${HOSTNAME}/api/getresult`);
  check(res, { 'GET /api/getresult status is 200': (r) => r.status === 200 });
  
  const result = JSON.parse(res.body);
  const totalVotes = result.yes + result.no + result.abstain;
  check(res, { 'Total votes match number of voters': () => totalVotes === VOTERS });
}

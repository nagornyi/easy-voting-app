import { openDB } from './db';
let votingActive = false;
let timeRemaining = 0;
let startTime = null;
let intervalId = null;

const saveVotingStatus = async (is_active, time_remaining) => {
  const db = await openDB();
  const existing = await db.get('SELECT * FROM voting_status WHERE id = 1');
  
  if (existing) {
    await db.run('UPDATE voting_status SET is_active = ?, time_remaining = ? WHERE id = 1', [is_active, time_remaining]);
  } else {
    await db.run('INSERT INTO voting_status (is_active, time_remaining) VALUES (?, ?)', [is_active, time_remaining]);
  }
};

const startVote = async (timer_duration) => {
    votingActive = true;
    timeRemaining = timer_duration;    
    startTime = Date.now();
    
    // Clear previous timer if exists
    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(async () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeRemaining = timer_duration - elapsed;
        await saveVotingStatus(votingActive, timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(intervalId);
            votingActive = false;
            timeRemaining = 0;
            await saveVotingStatus(votingActive, timeRemaining);
            global.isVotingActive = false;
            // Call the global function to notify connected clients
            if (typeof global.onVotingEnd === 'function') {
              global.onVotingEnd();
            }
        }
    }, 1000);
};

const getVotingStatus = async () => {
  const db = await openDB();
  const row = await db.get('SELECT is_active, time_remaining FROM voting_status WHERE id = 1');
  return row || { is_active: 0, time_remaining: 0 };  // Return defaults if no data is found
};

export { startVote, getVotingStatus };

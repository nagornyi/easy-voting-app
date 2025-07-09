import { openDB, setVotingStatus } from '@/src/db';
let votingActive = false;
let timeRemaining = 0;
let startTime = null;
let intervalId = null;

const saveVotingStatus = async (is_active, time_remaining) => {
  const db = await openDB();
  await setVotingStatus(db, is_active, time_remaining);
};

const startVote = async (timer_duration) => {    
    votingActive = true;
    timeRemaining = timer_duration;
    // Activate the voting
    await saveVotingStatus(votingActive, timeRemaining);

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
            // Deactivate the voting
            await saveVotingStatus(votingActive, timeRemaining);
        }
    }, 1000);
};

export { startVote };

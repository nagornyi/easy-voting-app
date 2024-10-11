import { useEffect, useState } from 'react';

const VotingPage = () => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingID, setVotingID] = useState(null);

  // Poll the voting status every 500ms if voting is not active
  useEffect(() => {
    let pollVotingStatus;
    let localTimer;

    if (!isVotingActive) {
      pollVotingStatus = setInterval(async () => {
        try {
          const response = await fetch('/api/votingstatus');
          if (!response.ok) {
            throw new Error('Failed to fetch voting status');
          }
          const data = await response.json();
          if (data.is_active) { // If voting is active
            setIsVotingActive(true); // Set voting active status to true
            setHasVoted(false); // Reset hasVoted if the previous voting has ended
            setVotingID(data.voting_id); // Set new voting ID
            setTimeRemaining(data.time_remaining - 1); // Set time remaining only once (minus 1 second to prevent voting failures)
          }
        } catch (error) {
          console.error('Error fetching voting status:', error);
        }
      }, 500); // Poll every 500ms
    }

    if (timeRemaining <= 0) {
      // Hide buttons and resume polling after the voting has ended
      setHasVoted(true);
      setIsVotingActive(false);
    }

    // Start a local timer to countdown if voting is active
    if (isVotingActive) {
      localTimer = setInterval(() => {
        setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000); // Local countdown every second
    }

    return () => {
      clearInterval(pollVotingStatus);
      clearInterval(localTimer);
    };
  }, [isVotingActive, hasVoted, timeRemaining]);

  // Handle vote submission and stop displaying buttons
  const handleVote = async (vote) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      // Hide buttons after voting
      setHasVoted(true);
      localStorage.setItem('voting-id', votingID);
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  return (
    <div className="container">
      {timeRemaining === null ? (
        <div className="container">
          <div className="results">
            <h2>ПЕРЕРВА У ГОЛОСУВАННІ</h2>
          </div>
        </div>
      ) : isVotingActive && timeRemaining > 0 && !hasVoted && localStorage.getItem('voting-id') !== votingID ? (
        <>
          <div className="buttons">
            <button className="vote-button green" onClick={() => handleVote('yes')}>ЗА</button>
            <button className="vote-button yellow" onClick={() => handleVote('abstain')}>УТРИМУЮСЬ</button>
            <button className="vote-button red" onClick={() => handleVote('no')}>ПРОТИ</button>
          </div>
          <div className="timer">
            ГОЛОСУВАННЯ ЗАВЕРШИТЬСЯ ЧЕРЕЗ: {timeRemaining} сек
          </div>
        </>
      ) : (
        <div className="results">
          <h2>ГОЛОСУВАННЯ ЗАВЕРШЕНО</h2>
        </div>
      )}
    </div>
  );
};

export default VotingPage;

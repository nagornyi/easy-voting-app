import { useEffect, useState } from 'react';

const VotingPage = () => {
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Countdown timer
  const [hasVoted, setHasVoted] = useState(false);

  // Fetch voting status when the page loads
  useEffect(() => {
    async function fetchVotingStatus() {
      const response = await fetch('/api/votingstatus');
      const data = await response.json();
      setIsVotingActive(data.is_active === 1); // Set voting status
    }
    fetchVotingStatus();
  }, []);

  // Timer logic
  useEffect(() => {
    if (isVotingActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval); // Clear interval on unmount
    } else if (timeLeft === 0 || hasVoted) {
      setIsVotingActive(false);
    }
  }, [isVotingActive, timeLeft, hasVoted]);

  // Function to handle vote submission
  async function handleVote(vote) {
    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to submit vote', error);
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/votingstatus');
      const data = await response.json();
      setIsVotingActive(data.is_active === 1);
    }, 1000); // Poll every 1 second
  
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container">
      {!hasVoted && isVotingActive ? (
        <>
          <div className="buttons">
            <button className="vote-button green" onClick={() => handleVote('yes')}>ЗА</button>
            <button className="vote-button yellow" onClick={() => handleVote('abstain')}>УТРИМУЮСЬ</button>
            <button className="vote-button red" onClick={() => handleVote('no')}>ПРОТИ</button>
          </div>
          <div className="timer">
            ГОЛОСУВАННЯ ЗАВЕРШИТЬСЯ ЧЕРЕЗ: {timeLeft} сек
          </div>
        </>
      ) : (
        <div className="results">
          <h2>ГОЛОСУВАННЯ ЗАВЕРШЕНО</h2>
        </div>
      )}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: blue;
          color: white;
          text-align: center;
        }
        .buttons {
          display: flex;
          width: 100%;
          max-width: 600px;
          justify-content: space-around;
          margin-bottom: 20px;
        }
        .vote-button {
          width: 30%;
          padding: 20px;
          font-size: 20px;
          font-weight: bold;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .green {
          background-color: green;
        }
        .yellow {
          background-color: #ffcc00;
        }
        .red {
          background-color: red;
        }
        .timer {
          font-size: 18px;
          margin-top: 20px;
        }
        .results h2 {
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .buttons {
            flex-direction: column;
            gap: 10px;
          }
          .vote-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default VotingPage;

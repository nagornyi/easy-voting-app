import { useEffect, useState } from 'react';
import axios from 'axios';

const VotingPage = () => {
  const [voteComplete, setVoteComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Лічильник на 10 секунд
  const [voteResult, setVoteResult] = useState(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!voteComplete) {
      completeVoting();
    }
  }, [timeLeft]);

  const handleVote = async (vote) => {
    try {
      await axios.post('/api/vote', { vote });
      completeVoting();
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const completeVoting = () => {
    setVoteComplete(true);
    setTimeLeft(0);
    getResults();
  };

  const getResults = async () => {
    try {
      const { data } = await axios.get('/api/getresult');
      setVoteResult(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  return (
    <div className="container">
      {!voteComplete ? (
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
          <div>ЗА: {voteResult?.yes || 0}</div>
          <div>УТРИМУЮСЬ: {voteResult?.abstain || 0}</div>
          <div>ПРОТИ: {voteResult?.no || 0}</div>
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

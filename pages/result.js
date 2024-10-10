import { useEffect, useState } from 'react';

function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateClock(); // Initial call to display clock immediately
    const intervalId = setInterval(updateClock, 1000 * 60); // Update clock every minute

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return <div className="clock">{time}</div>;
}

export default function Result() {
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOnRecess, setIsOnRecess] = useState(false);
  const [votingNumber, setVotingNumber] = useState(null);

  // Poll voting status every 500ms
  useEffect(() => {
    const pollVotingStatus = setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setIsVotingActive(data.is_active);
        setTimeRemaining(data.time_remaining);

        if (!data.is_active) {
          // Set result only when voting is inactive          
          const resultData = await data.results;
          setResults(resultData);

          // Set recess status when voting is inactive
          setIsOnRecess(data.is_onrecess);

          // Set voting number when voting is inactive
          setVotingNumber(data.voting_number);
        }
      } catch (error) {
        console.error('Error fetching voting status or result:', error);
      }
    }, 500);

    return () => clearInterval(pollVotingStatus);
  }, []);

  if (isOnRecess) {
    return (
      <div className="result-screen">
        <div className="resultheader">
          ПАРЛАМЕНТ НА КАНІКУЛАХ
        </div>
      </div>
    );
  }

  if (isVotingActive && timeRemaining > 0) {
    return (
      <div className="result-screen">
        <div className="resultheader">
          ТРИВАЄ ГОЛОСУВАННЯ
        </div>
      </div>
    );
  }

  if (votingNumber === 0) {
    return (
      <div className="result-screen">
        <div className="resultheader">
          НОВА СЕСІЯ ВЕРХОВНОЇ РАДИ
        </div>
      </div>
    );
  }

  if (results) {
    const { yes, no, abstain } = results;
    const total = yes + no + abstain;    
    var decision = 'ВІДСУТНІСТЬ КВОРУМУ';
    var decision_type = 'noquorum';
    if (total > 0) {
      if (yes > total / 2) {
        decision = 'РІШЕННЯ ПРИЙНЯТО';
        decision_type = 'accepted';
      } else {
        decision = 'РІШЕННЯ НЕ ПРИЙНЯТО';
        decision_type = 'rejected';
      }      
    }

    return (
      <div className="result-screen">
        {/* Clock in the upper-right corner */}
        <Clock />

        {/* Voting Results */}
        <div className="resultheader">
          ПІДСУМКИ ГОЛОСУВАННЯ&nbsp;&nbsp;&nbsp;&nbsp;<span className='votingnum'>№ {votingNumber}</span>
        </div>

        <div className="summary-wrapper">
          <div className="summary">
            <div className="column">
              <p>ЗА:</p>
              <p>ПРОТИ:</p>
              <p>УТРИМАЛИСЬ:</p>
              <p>ВСЬОГО:</p>
            </div>
            <div className="column">
              <p><span className='yesvotes'>{yes}</span></p>
              <p><span className='novotes'>{no}</span></p>
              <p><span className='abstainvotes'>{abstain}</span></p>
              <p>{total}</p>
            </div>
          </div>
        </div>

        <div className={`decision ${decision_type}`}>
          {decision}
        </div>
      </div>
    );
  }

  return null; // Return nothing if no data yet
}

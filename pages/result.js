import { useEffect, useState } from 'react';

export default function Result() {
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOnRecess, setIsOnRecess] = useState(false);

  // Poll voting status every second
  useEffect(() => {
    const pollVotingStatus = setInterval(async () => {
      try {
        const res = await fetch('/api/votingstatus');
        const data = await res.json();
        setIsVotingActive(data.is_active);
        setTimeRemaining(data.time_remaining);

        if (!data.is_active) {
          // Fetch result only when voting is inactive
          const resultRes = await fetch('/api/getresult');
          const resultData = await resultRes.json();
          setResults(resultData);

          // Check if the parliament is on recess when voting is inactive
          const recessRes = await fetch('/api/isonrecess');
          const recessData = await recessRes.json();
          setIsOnRecess(recessData.is_onrecess);
        }
      } catch (error) {
        console.error('Error fetching voting status or result:', error);
      }
    }, 1000);

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
        <div className="resultheader">
          ПІДСУМКИ ГОЛОСУВАННЯ
        </div>
        <div className="summary">
          <p>ЗА: <span className='yesvotes'>{yes}</span></p>
          <p>ПРОТИ: <span className='novotes'>{no}</span></p>
          <p>УТРИМАЛИСЬ: <span className='abstainvotes'>{abstain}</span></p>
          <p>ВСЬОГО: {total}</p>
        </div>
        <div className={`decision ${decision_type}`}>
          {decision}
        </div>
      </div>
    );
  }

  return null; // Return nothing if no data yet
}

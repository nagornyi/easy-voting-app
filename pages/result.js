import { useEffect, useState } from 'react';

export default function Result() {
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Poll voting status every second
  useEffect(() => {
    const pollVotingStatus = setInterval(async () => {
      try {
        const res = await fetch('/api/votingstatus');
        const data = await res.json();
        setIsVotingActive(data.is_active === 1);
        setTimeRemaining(data.time_remaining);

        if (!data.is_active) {
          // Fetch result only once when voting is inactive
          const resultRes = await fetch('/api/getresult');
          const resultData = await resultRes.json();
          setResults(resultData);
        }
      } catch (error) {
        console.error('Error fetching voting status or result:', error);
      }
    }, 1000);

    return () => clearInterval(pollVotingStatus);
  }, []);

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
    const decision = yes > total / 2 ? 'РІШЕННЯ ПРИЙНЯТО' : 'РІШЕННЯ НЕ ПРИЙНЯТО';

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
        <div className={`decision ${decision === 'РІШЕННЯ ПРИЙНЯТО' ? 'accepted' : 'rejected'}`}>
          {decision}
        </div>
      </div>
    );
  }

  return null; // Return nothing if no data yet
}

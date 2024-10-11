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
    const intervalId = setInterval(updateClock, 1000); // Update clock every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return <div className="clock">{time}</div>;
}

export default function Result() {
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOnRecess, setIsOnRecess] = useState(false);
  const [votingNumber, setVotingNumber] = useState(null);

  // Poll voting status every 500ms
  useEffect(() => {
    let pollVotingStatus;
    let pollLiveResults;
    let localTimer;

    if (!isVotingActive) {
      pollVotingStatus = setInterval(async () => {
        try {
          const res = await fetch('/api/status');
          const data = await res.json();          

          // Set recess status when voting is inactive
          setIsOnRecess(data.is_onrecess);

          // Set result when voting is inactive          
          const resultData = await data.results;
          setResults(resultData);

          // Set voting number when voting is inactive
          setVotingNumber(data.voting_number);

          if (data.is_active) {
            setIsVotingActive(true); // Set voting active status to true when voting becomes active
            setTimeRemaining(data.time_remaining - 1); // Set time remaining only once (minus 1 second to prevent voting failures)
          }
        } catch (error) {
          console.error('Error fetching voting status or result:', error);
        }
      }, 500);
    } else {
      pollLiveResults = setInterval(async () => {
        try {
          const res = await fetch('/api/status');
          const data = await res.json();

          // Set result when voting is active          
          const resultData = await data.results;
          setResults(resultData);

          // Set voting number when voting is active
          setVotingNumber(data.voting_number);
        } catch (error) {
          console.error('Error fetching voting status or result:', error);
        }
      }, 500);
    }

    if (timeRemaining <= 0) {
      // Voting has ended
      setIsVotingActive(false)
    }

    // Start a local timer to countdown if voting is active
    if (isVotingActive) {
      localTimer = setInterval(() => {
        setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000); // Local countdown every second
    }

    return () => {
      clearInterval(pollVotingStatus);
      clearInterval(pollLiveResults);
      clearInterval(localTimer);
    };
  }, [isVotingActive, timeRemaining]);

  if (isOnRecess) {
    return (
      <div className="result-screen">
        <div className="resultheader">
          ПАРЛАМЕНТ НА КАНІКУЛАХ
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
    var title;
    var decision;
    var decision_type;
    if (!isVotingActive) {
      title = 'ПІДСУМКИ ГОЛОСУВАННЯ';
      if (total === 0) {
        decision = 'ВІДСУТНІСТЬ КВОРУМУ';
        decision_type = 'noquorum';
      } else if (yes > total / 2) {
        decision = 'РІШЕННЯ ПРИЙНЯТО';
        decision_type = 'accepted';
      } else {
        decision = 'РІШЕННЯ НЕ ПРИЙНЯТО';
        decision_type = 'rejected';
      }
    } else {
      title = 'ТРИВАЄ ГОЛОСУВАННЯ';
      decision = `ЗАВЕРШЕННЯ ЧЕРЕЗ: ${timeRemaining} СЕК`;
      decision_type = 'activevoting';
    }

    return (
      <div className="result-screen">
        {/* Clock in the upper-right corner */}
        <Clock />

        {/* Voting Results */}
        <div className="resultheader">
          {title}&nbsp;&nbsp;&nbsp;&nbsp;<span className='votingnum'>№ {votingNumber}</span>
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

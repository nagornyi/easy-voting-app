/* Result screen for voting results
 * This screen displays the results of the voting process, including the status of the vote,
 * the time remaining, and the final decision based on the votes cast.
 * It also handles the display of results for both text-to-vote and single-motion voting types
 * and updates the UI dynamically based on the voting status.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const VoteBarChart = dynamic(() => import('../src/votebarchart'), { ssr: false });

function ResultScreenCSSLoader() {
  useEffect(() => {
    // Remove any previously loaded result-screen.css to avoid duplicates
    const prev = document.getElementById('result-screen-css');
    if (prev) prev.remove();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/styles/result-screen.css';
    link.id = 'result-screen-css';
    link.type = 'text/css';
    link.media = 'all';
    document.head.appendChild(link);
    return () => {
      const existing = document.getElementById('result-screen-css');
      if (existing) existing.remove();
    };
  }, []);
  return null;
}

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

function Logo() {
  const [parliamentName, setParliamentName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-parliament-info');
        if (!response.ok) {
          throw new Error('Failed to fetch parliament info');
        }
        const data = await response.json();
        setParliamentName(data.parliament_name); // Set custom name
      } catch (error) {
        console.error('Error fetching parliament info:', error);
      }
    };
    fetchData();
  }, []);

  return <div className="logo">{parliamentName}</div>;
}

export default function Result() {
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isOnRecess, setIsOnRecess] = useState(false);
  const [votingNumber, setVotingNumber] = useState(null);
  const [voteType, setVoteType] = useState(null);
  // This additional time is needed to prevent losing votes due to network latency
  const VOTES_PROCESSING_PERIOD = 3;

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
          setResults(data.results);
          // Set voting number when voting is inactive
          setVotingNumber(data.voting_number);
          // Save vote_type when voting is inactive
          setVoteType(data.vote_type);

          if (data.is_active) {
            // Set voting active status to true when voting becomes active
            setIsVotingActive(true);
            // Set time remaining only once
            setTimeRemaining(data.time_remaining + VOTES_PROCESSING_PERIOD);
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
          setResults(data.results);
          // Set voting number when voting is active
          setVotingNumber(data.voting_number);
          // Save vote_type when voting is active
          setVoteType(data.vote_type);
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

  return (
    <>
      <ResultScreenCSSLoader />
      {isOnRecess ? (
        <div className="result-screen">
          <div className="resultheader">
            ПАРЛАМЕНТ НА КАНІКУЛАХ
          </div>
        </div>
      ) : votingNumber === 0 ? (
        <div className="result-screen">
          <div className="resultheader">
            НОВА СЕСІЯ ВЕРХОВНОЇ РАДИ
          </div>
        </div>
      ) : results ? (
        (() => {
          // Use voteType from state, not from results
          let barData = null, title, decision, decision_type, winner = null, isTie = false;

          if (voteType === 'text-to-vote') {
            const codeCounts = Object.entries(results).filter(([k]) => k !== 'vote_type');
            const maxVotes = codeCounts.length ? Math.max(...codeCounts.map(([, v]) => v)) : 0;
            const winners = codeCounts.filter(([, v]) => v === maxVotes && maxVotes > 0).map(([k]) => k);
            isTie = winners.length > 1;
            winner = winners.length === 1 ? winners[0] : null;
            barData = codeCounts;
            if (!isVotingActive) {
              title = 'ПІДСУМКИ ГОЛОСУВАННЯ';
              if (codeCounts.length === 0 || maxVotes === 0) {
                decision = 'ВІДСУТНІСТЬ КВОРУМУ';
                decision_type = 'noquorum';
              } else if (!isTie) {
                decision = `ПЕРЕМОЖЕЦЬ: ${winner}`;
                decision_type = 'accepted';
              } else {
                decision = 'ПЕРЕМОЖЦІВ НЕМАЄ';
                decision_type = 'rejected';
              }
            } else if (timeRemaining > VOTES_PROCESSING_PERIOD) {
              title = 'ТРИВАЄ ГОЛОСУВАННЯ';
              decision = `ДО ЗАВЕРШЕННЯ: ${timeRemaining - VOTES_PROCESSING_PERIOD} СЕК`;
              decision_type = 'activevoting';
            } else if (timeRemaining <= VOTES_PROCESSING_PERIOD && timeRemaining > 0) {
              title = 'ПІДРАХУНОК ГОЛОСІВ';
              decision = `ДО ЗАВЕРШЕННЯ: ${timeRemaining} СЕК`;
              decision_type = 'votesprocessing';
            }
          } else if (voteType === 'single-motion') {
            const yes = results.yes || 0;
            const no = results.no || 0;
            const abstain = results.abstain || 0;
            const total = yes + no + abstain;
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
            } else if (timeRemaining > VOTES_PROCESSING_PERIOD) {
              title = 'ТРИВАЄ ГОЛОСУВАННЯ';
              decision = `ДО ЗАВЕРШЕННЯ: ${timeRemaining - VOTES_PROCESSING_PERIOD} СЕК`;
              decision_type = 'activevoting';
            } else if (timeRemaining <= VOTES_PROCESSING_PERIOD && timeRemaining > 0) {
              title = 'ПІДРАХУНОК ГОЛОСІВ';
              decision = `ДО ЗАВЕРШЕННЯ: ${timeRemaining} СЕК`;
              decision_type = 'votesprocessing';
            }
          } else {
            title = 'НЕВІДОМИЙ ТИП ГОЛОСУВАННЯ';
            decision = 'Немає даних для відображення';
            decision_type = 'unknown';
          }

          return (
            <div className="result-screen">
              <Clock />
              <Logo />
              <div className="resultheader">
                {title}&nbsp;&nbsp;&nbsp;&nbsp;<span className='votingnum'>№ {votingNumber}</span>
              </div>
              {voteType === 'text-to-vote' && barData ? (
                <div className="bar-chart" style={{margin: '32px auto', width: '90%', maxWidth: 600}}>
                  <VoteBarChart data={barData} />
                </div>
              ) : voteType === 'single-motion' ? (
                <div className="summary-wrapper">
                  <div className="summary">
                    <div className="column">
                      <p>ЗА:</p>
                      <p>ПРОТИ:</p>
                      <p>УТРИМАЛИСЬ:</p>
                      <p>ВСЬОГО:</p>
                    </div>
                    <div className="column">
                      <p><span className='yesvotes'>{results.yes || 0}</span></p>
                      <p><span className='novotes'>{results.no || 0}</span></p>
                      <p><span className='abstainvotes'>{results.abstain || 0}</span></p>
                      <p>{(results.yes || 0) + (results.no || 0) + (results.abstain || 0)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>НЕВІДОМИЙ ТИП ГОЛОСУВАННЯ</div>
              )}
              <div className={`decision ${decision_type}`}>{decision}</div>
            </div>
          );
        })()
      ) : null}
    </>
  );
}

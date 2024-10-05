import { useEffect, useState } from 'react';

export default function Result() {
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Make sure this runs only in the browser
    if (typeof window !== 'undefined') {   
      console.log("INIT OF EVENTSOURCE START");
      const eventSource = new EventSource('/api/updates');
      console.log("EVENTSOURCE CONTENTS: "+JSON.stringify(eventSource));
  
      eventSource.onmessage = (event) => {
        console.log("PARSING EVENT");
        const data = JSON.parse(event.data);
        console.log('Received event:', data);
        if (data.type === 'VOTING_STARTED') {
          console.log('Voting has started');
          setIsVotingActive(true);
        } else if (data.type === 'VOTING_ENDED') {
          console.log('Voting has ended');
          setIsVotingActive(false);
        }
      };
  
      eventSource.onerror = (error) => {
        console.error('SSE connection error', error);
        setTimeout(() => {
          const newEventSource = new EventSource('/api/updates');
          // Repeat the same onmessage and onerror logic
        }, 5000); // Retry after 5 seconds
      };

      // Clean up on unmount
      return () => {
        eventSource.close();
      };
    }
  }, []);  

  // Poll voting status every second, but only when voting is not active
  useEffect(() => {
    if (!isVotingActive) {
      const pollVotingStatus = setInterval(async () => {
        try {
          const resultRes = await fetch('/api/getresult');
          const resultData = await resultRes.json();
          setResults(resultData);
        } catch (error) {
          console.error('Error fetching voting result:', error);
        }
      }, 1000);

      return () => clearInterval(pollVotingStatus);
    }
  }, [isVotingActive]);

  if (isVotingActive) {
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

  return null;
}

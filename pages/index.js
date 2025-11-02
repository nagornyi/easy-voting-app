/* A React component for a voting page with dynamic styles based on vote type.
 * It supports two vote types: 'text-to-vote' and 'single-motion'.
 * The component polls the voting status, handles vote submission, and dynamically loads styles.
 * It also includes a retro phone mockup for the 'text-to-vote' mode.
 * The voting status is fetched from an API, and the component updates the UI accordingly.
 * The voting buttons and input fields are displayed based on the current voting state.
 * The component also handles the countdown timer for voting and displays results after voting ends.
 * The original layout for the retro phone mockup was created by https://manz.dev/
 * at https://codepen.io/manz/pen/zYwMVxN.
 */

import { useEffect, useState, useRef } from 'react';

const VotingPage = () => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingID, setVotingID] = useState(null);
  const [voteType, setVoteType] = useState(null);
  const [textVote, setTextVote] = useState('');
  const [cssLoaded, setCssLoaded] = useState(false);
  const inputRef = useRef(null);

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

          // If voting is active
          if (data.is_active) {
            // Set voting active status to true
            setIsVotingActive(true);
            // Reset hasVoted if the previous voting has ended
            setHasVoted(false);
            // Set new voting ID
            setVotingID(data.voting_id);
            // Set time remaining only once (minus 1 second to prevent voting failures)
            setTimeRemaining(data.time_remaining - 1);

            // Fetch vote type when voting starts
            try {
              const voteTypeRes = await fetch('/api/get-vote-type');
              if (voteTypeRes.ok) {
                const voteTypeData = await voteTypeRes.json();
                setVoteType(voteTypeData.vote_type);
                if (voteTypeData.vote_type === 'text-to-vote') {
                  // Make sure the code input is empty when voting starts
                  setTextVote('');
                }
              } else {
                setVoteType(null);
              }
            } catch {
              setVoteType(null);
            }
          }
        } catch (error) {
          console.error('Error fetching voting status:', error);
        }
      }, 500); // Poll every 500ms
    }

    if (timeRemaining <= 0) {
      // Hide buttons and resume polling after the voting has ended
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

  // Dynamically load the correct CSS for each vote type and for break screen
  useEffect(() => {
    let textVoteSheet, singleMotionVoteSheet, breakScreenSheet;
    let loadedCount = 0;
    const totalSheets = voteType === 'text-to-vote' ? 2 : voteType === 'single-motion' ? 2 : 1;
    setCssLoaded(false);

    // Always load break-screen.css for break screen
    breakScreenSheet = document.createElement('link');
    breakScreenSheet.rel = 'stylesheet';
    breakScreenSheet.href = '/styles/break-screen.css';
    breakScreenSheet.id = 'break-screen-css';
    breakScreenSheet.onload = () => {
      loadedCount++;
      if (loadedCount === totalSheets) setCssLoaded(true);
    };
    document.head.appendChild(breakScreenSheet);

    if (voteType === 'text-to-vote') {
      // Load text-vote.css
      textVoteSheet = document.createElement('link');
      textVoteSheet.rel = 'stylesheet';
      textVoteSheet.href = '/styles/text-vote.css';
      textVoteSheet.id = 'text-vote-css';
      textVoteSheet.onload = () => {
        loadedCount++;
        if (loadedCount === totalSheets) setCssLoaded(true);
      };
      document.head.appendChild(textVoteSheet);
      // Remove single-motion.css if present
      const existingSingleMotion = document.getElementById('single-motion-css');
      if (existingSingleMotion) existingSingleMotion.remove();
    } else if (voteType === 'single-motion') {
      // Load single-motion.css
      singleMotionVoteSheet = document.createElement('link');
      singleMotionVoteSheet.rel = 'stylesheet';
      singleMotionVoteSheet.href = '/styles/single-motion.css';
      singleMotionVoteSheet.id = 'single-motion-css';
      singleMotionVoteSheet.onload = () => {
        loadedCount++;
        if (loadedCount === totalSheets) setCssLoaded(true);
      };
      document.head.appendChild(singleMotionVoteSheet);
      // Remove text-vote.css if present
      const existingTextVote = document.getElementById('text-vote-css');
      if (existingTextVote) existingTextVote.remove();
    } else {
      // Remove both if present
      const existingSingleMotion = document.getElementById('single-motion-css');
      if (existingSingleMotion) existingSingleMotion.remove();
      const existingTextVote = document.getElementById('text-vote-css');
      if (existingTextVote) existingTextVote.remove();
      // Only break-screen.css needs to load
    }
    return () => {
      if (textVoteSheet && textVoteSheet.parentNode) {
        textVoteSheet.parentNode.removeChild(textVoteSheet);
      }
      if (singleMotionVoteSheet && singleMotionVoteSheet.parentNode) {
        singleMotionVoteSheet.parentNode.removeChild(singleMotionVoteSheet);
      }
      if (breakScreenSheet && breakScreenSheet.parentNode) {
        breakScreenSheet.parentNode.removeChild(breakScreenSheet);
      }
    };
  }, [voteType]);

  // Handle vote submission and stop displaying buttons
  const handleVote = async (vote) => {
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      if (!response.ok) {
        // We do not want to show an error message to the user, just log it
        console.error('Failed to submit vote');
      }
      // Hide buttons after voting
      setHasVoted(true);
      localStorage.setItem('voting-id', votingID);
      setTextVote(''); // Clear text input after voting
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const keyMap = [
    { digit: '1', text: 'o_o' },
    { digit: '2', text: 'abc' },
    { digit: '3', text: 'def' },
    { digit: '4', text: 'ghi' },
    { digit: '5', text: 'jkl' },
    { digit: '6', text: 'mno' },
    { digit: '7', text: 'pqrs' },
    { digit: '8', text: 'tuv' },
    { digit: '9', text: 'wxyz' },
    { digit: '*', text: '+' },
    { digit: '0', text: '[' },
    { digit: '#', text: '' }
  ];

  if (!cssLoaded) {
    // Show a loading spinner while CSS loads
    return (
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#009AEE', color: 'white'}}>
          <div style={{
            width: 48,
            height: 48,
            border: '6px solid #009AEE',
            borderTop: '6px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </body>      
    );
  }
  return (
    <div className={
      timeRemaining === null
        ? 'break-container'
        : voteType === 'text-to-vote'
        ? 'text-vote-container'
        : 'container'
    }>
      {timeRemaining === null ? (
        <div className="break-container">
          <div className="break-results">
            <h2>ПЕРЕРВА У ГОЛОСУВАННІ</h2>
          </div>
        </div>
      ) : isVotingActive && timeRemaining > 0 && !hasVoted && localStorage.getItem('voting-id') !== votingID ? (
        voteType === 'single-motion' ? (
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
        ) : voteType === 'text-to-vote' ? (
          <>
            <div className="text-vote-banner">
            Щоб ввести код, ви можете скористатися кнопками на зображенні телефону
            </div>
            <div className="container">
              <div className="oval-container">
                <div className="nokia3310">
                  <div className="nokia-head-container">
                    <div className="speaker">
                      <div className="hole"></div>
                      <div className="hole"></div>
                      <div className="hole"></div>
                      <div className="hole"></div>
                      <div className="hole"></div>
                    </div>
                    <div className="logo">NOKIA</div>
                    <div className={`screen-container${isVotingActive && voteType === 'text-to-vote' && !hasVoted ? ' blinking-frame' : ''}`}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={textVote}
                        onChange={e => {
                          if (e.target.value.length <= 5) setTextVote(e.target.value);
                        }}
                        className="text-vote-input nokia-screen-text"
                        disabled={hasVoted}
                        maxLength={5}
                      />
                    </div>
                    <div className="bottom-oval">
                      <div className="big button top"
                        onClick={() => handleVote(textVote)}
                        style={{
                          cursor: hasVoted || !textVote.trim() ? 'default' : 'pointer'
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label="Send code"
                      ></div>
                    </div>
                  </div>
                  <div className="bottom-buttons">
                    <div
                      className="big button left"
                      onClick={() => {
                        if (!hasVoted && textVote.length > 0) {
                          setTextVote(textVote.slice(0, -1));
                        }
                      }}
                      style={{ cursor: !hasVoted && textVote.length > 0 ? 'pointer' : 'default' }}
                      tabIndex={0}
                      role="button"
                      aria-label="Erase last character"
                    >
                      <span>C</span>
                    </div>
                    <div className="big button right">
                      <span>&lt;</span>
                      <span>&gt;</span>
                    </div>
                  </div>
                  <div className="keyboard">
                    {keyMap.map((key, idx) => (
                      <div
                        className={`button-key-container${idx % 3 === 2 ? ' invert' : ''}`}
                        key={key.digit}
                        onClick={() => {
                          // Only allow 0-9, *, # as input, and max 5 chars
                          if (
                            !hasVoted &&
                            textVote.length < 5 &&
                            (/[0-9*#]/.test(key.digit))
                          ) {
                            setTextVote(textVote + key.digit);
                          }
                        }}
                        style={{ cursor: !hasVoted && textVote.length < 5 && /[0-9*#]/.test(key.digit) ? 'pointer' : 'default' }}
                      >
                        <div className={`button-key ${idx % 3 === 0 ? 'left' : idx % 3 === 1 ? 'middle' : 'right'}`}>
                          <span className="special">{key.digit}</span>
                          <span className={`minitext${key.digit === '1' ? ' compact' : ''}${key.digit === '0' ? ' rotate' : ''}${key.digit === '#' ? ' home' : ''}`}>
                            {key.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="down">
                  <button
                    onClick={() => handleVote(textVote)}
                    disabled={hasVoted || !textVote.trim()}
                  >ГОЛОСУВАТИ</button>
                </div>
              </div>
            </div>
            <div className="text-vote-timer">
              ГОЛОСУВАННЯ ЗАВЕРШИТЬСЯ ЧЕРЕЗ {timeRemaining} сек
            </div>
          </>
        ) : null
      ) : hasVoted || localStorage.getItem('voting-id') === votingID ? (
        <div className="break-container">
          <div className="break-results">
            <h2>ВИ ПРОГОЛОСУВАЛИ</h2>
          </div>
        </div>
      ) : (
        <div className="break-container">
          <div className="break-results">
            <h2>ГОЛОСУВАННЯ ЗАВЕРШЕНО</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingPage;

export const config = {
  api: {
    bodyParser: false,  // Disable body parsing for SSE
  },
};

export default function handler(req, res) {
  console.log("SSE route hit");
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ensure CORS is handled if needed
  res.flushHeaders(); // Send headers right away to establish SSE connection
  console.log("SSE headers sent");

  // setInterval(() => {
  //   res.write(': keep-alive\n\n');
  // }, 5000);  // Send every 5 seconds  

  // Keep-alive ping every 20 seconds
  const keepAliveInterval = setInterval(() => {
    res.write(':keepalive\n\n');  // SSE comment (keep-alive ping)
  }, 5000);  // 5 seconds

  // Function to send an event
  const sendEvent = (event) => {
    if (!event) {
      console.error("No event to send!");
    }
    console.log("Sending event:", event);
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // On voting started
  global.onVotingStart = () => {
    console.log('Voting has started');
    sendEvent({ type: 'VOTING_STARTED' });
  };

  // On voting ended
  global.onVotingEnd = () => {
    console.log('Voting has ended');
    sendEvent({ type: 'VOTING_ENDED' });
  };

  setTimeout(() => {
    sendEvent({ type: 'TEST_EVENT' });
  }, 5000);  // Send a test event after 5 seconds

  setTimeout(() => sendEvent({ type: 'VOTING_STARTED' }), 2000);
  setTimeout(() => sendEvent({ type: 'VOTING_ENDED' }), 10000);

  // Cleanup when client closes the connection
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    res.end();
  });
}

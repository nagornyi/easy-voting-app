Single page responsive voting app with a simple API implemented in Next.js, inspired by (but not affiliated with) the voting system of the Ukrainian parliament "Rada".

## Install the dependencies

Install packages:

```sh
npm install --registry https://registry.npmjs.org
```

Also you need to install Redis. In production environment please set the following variables to access Redis server, you can replace `localhost` with the server of your choice if Redis is deployed on a different instance.

```sh
export NODE_ENV="production"
export REDIS_URL="redis://localhost:6379"
```

## Start the development server on port 3000

```sh
npm run dev
```

## Build the production version

```sh
npm run build
```

## Start the production server

```sh
npm run start
```

Optional: Serve on a Different Port

```sh
PORT=4000 npm run start
```

## Voting workflow

1. Each voter opens the `/` page and waits for the voting process to start
2. The administrator user sends a single POST `/api/startsession` request to start new parliamentary session
3. The administrator user sends a single POST `/api/startvote` request to start new voting procedure
4. Voters cast their votes on the `/` page
5. After the voting has finished, the latest voting results can be viewed on the `/result` page

## API

In production you should replace `localhost:3000` with the production server hostname.

### Start new parliamentary session (resets the voting number)

The default vote type is 'single-motion' (Yes/Abstain/No). You can also set a 'text-to-vote' type of vote that displays a retro mobile phone UI for an SMS voting simulator, where you can send a text code or number as your vote.

```sh
curl -X POST http://localhost:3000/api/startsession

curl -X POST http://localhost:3000/api/startsession -H "Content-Type: application/json" -d '{"vote_type": "single-motion"}'

curl -X POST http://localhost:3000/api/startsession -H "Content-Type: application/json" -d '{"vote_type": "text-to-vote"}'
```

### Start new voting process with a 10 sec timer (this is the default duration)

```sh
curl -X POST http://localhost:3000/api/startvote
```

### Start new voting process with a 20 sec timer

```sh
curl -X POST http://localhost:3000/api/startvote -H "Content-Type: application/json" -d '{"duration": 20}'
```

### Cast a vote (yes, abstain, no)

When the `vote_type` is `single-motion`, you can only cast "yes", "abstain" or "no" vote.

```sh
curl -X POST http://localhost:3000/api/vote -H "Content-Type: application/json" -d '{"vote": "yes"}'
```

When the `vote_type` is `text-to-vote`, you can cast any text vote.

```sh
curl -X POST http://localhost:3000/api/vote -H "Content-Type: application/json" -d '{"vote": "SLAVAUKRAINI"}'
```

### Get voting results

```sh
curl http://localhost:3000/api/getresult
```

Example response when the `vote_type` is `single-motion`:

```json
{
  "yes": 57,
  "abstain": 49,
  "no": 44
}
```

Example response when the `vote_type` is `text-to-vote`:

```json
{
  "ABCD2025": 10,
  "QWERTY": 34,
  "MARIA": 5,
  "HANNA": 21
}
```

### Get voting status

```bash
curl http://localhost:3000/api/votingstatus
```

Example response:

```json
{
  "is_active": true,
  "time_remaining": 5,
  "voting_number": 3,
  "voting_id": "zKPS9JGc"
}
```

### Get all the information with one request

```bash
curl http://localhost:3000/api/status
```

Example response when the `vote_type` is `single-motion`:

```json
{
  "is_active": false,
  "time_remaining": 0,
  "is_onrecess": false,
  "voting_number": 3,
  "vote_type": "single-motion",
  "results": {
    "yes": 57,
    "abstain": 49,
    "no": 44
  }
}

Example response when the `vote_type` is `text-to-vote`:

```json
{
  "is_active": false,
  "time_remaining": 0,
  "is_onrecess": false,
  "voting_number": 3,
  "vote_type": "text-to-vote",
  "results": {
    "ABCD2025": 10,
    "QWERTY": 34,
    "MARIA": 5,
    "HANNA": 21
  }
}
```

### Reset all votes

```sh
curl -X POST http://localhost:3000/api/resetvotes
```

### Set adjournment status (a break in the parliamentary session)

If you set this status to `true`, a special message will be displayed on the `/result` page, this status is false by default.

```sh
curl -X POST http://localhost:3000/api/setrecess -H "Content-Type: application/json" -d '{"status": true}'

curl -X POST http://localhost:3000/api/setrecess -H "Content-Type: application/json" -d '{"status": false}'
```

### Check if parliament is in recess

```bash
curl http://localhost:3000/api/isonrecess
```

Example response:

```json
{
  "is_onrecess": false
}
```

### Set parliament information

```sh
curl -X POST http://localhost:3000/api/set-parliament-info -H "Content-Type: application/json" -d '{"parliament_name": "MARTIAN ASSEMBLY"}'
```

## Load testing

You need to install the k6 tool (https://k6.io/) to run the load tests.

On Mac OS X (via Homebrew):

```sh
brew install k6
```

On Linux (via APT for Ubuntu/Debian):

```sh
sudo apt update
sudo apt install k6
```

On Windows (via Chocolatey):

```sh
choco install k6
```

Once k6 is installed, you can run the load test script from command line.

Load test for `single-motion` vote type:

```sh
VOTERS=100 HOSTNAME=https://yourapp.com k6 run test/single-motion-load-test.js
```

Load test for `text-to-vote` vote type:

```sh
VOTERS=100 HOSTNAME=https://yourapp.com k6 run test/text-to-vote-load-test.js
```

The number of voters defaults to 10 if the VOTERS environment variable is not provided. The hostname defaults to `http://localhost:3000` if not provided.

### Load test scenario

*Voters:* Controlled via VOTERS environment variable (default is `10`).

*Hostname:* Configurable via HOSTNAME environment variable (default is `localhost:3000`).

**Stage 1:** Each user polls `/api/votingstatus` every 500ms for 30 seconds.

**Stage 2:** A single admin user sends a POST request to `/api/startsession` to start a new session with specified vote type (`single-motion` or `text-to-vote`).

**Stage 3:** A single admin user sends a POST request to `/api/startvote` to start voting.

**Stage 4:** Each user sends a random vote to `/api/vote` and continues polling `/api/votingstatus` until the voting period ends (10 seconds).

**Stage 5:** A single admin user sends a GET request to `/api/getresult` and checks that the total votes equal the number of voters.

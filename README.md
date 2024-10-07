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

```sh
curl -X POST http://localhost:3000/api/startsession
```

### Start new voting process with a 10 sec timer (this is the default duration)

```sh
curl -X POST http://localhost:3000/api/startvote
```

### Start new voting process with a 15 sec timer

```sh
curl -X POST http://localhost:3000/api/startvote -H "Content-Type: application/json" -d '{"duration": 15}'
```

### Get voting results

```sh
curl http://localhost:3000/api/getresult
```

Example response:

```json
{"yes": 51, "abstain": 3, "no": 10}
```

### Get voting status

```bash
curl http://localhost:3000/api/votingstatus
```

Example response:

```json
{"is_active": true, "time_remaining": 5}
```

### Get all the information with one request

```bash
curl http://localhost:3000/api/status
```

Example response:

```json
{"is_active": false, "time_remaining": 0, "is_onrecess": false, "voting_number": 3, "results": {"yes": 0,"abstain": 0,"no": 1}}
```

### Reset all votes

```sh
curl -X POST http://localhost:3000/api/resetvotes
```

### Set recess status (a break during the parliamentary session), this is used for displaying a message on /result page, false by default

```sh
curl -X POST http://localhost:3000/api/setrecess -H "Content-Type: application/json" -d '{"status": true}'

curl -X POST http://localhost:3000/api/setrecess -H "Content-Type: application/json" -d '{"status": false}'
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

Once k6 is installed, you can run the load test script with:

```sh
k6 run --env VOTERS=100 --env HOSTNAME=https://your-host.com test/voting-load-test.js
```

The number of voters defaults to 10 if the VOTERS environment variable is not provided. The hostname defaults to http://localhost:3000 if not provided.

### Load test scenario

*Voters:* Controlled via VOTERS environment variable (default is 10).

*Hostname:* Configurable via HOSTNAME environment variable (default is localhost:3000).

**Stage 1:** Each user polls /api/votingstatus every second for 30 seconds.

**Stage 2:** A single admin user sends a POST request to /api/startvote to start voting.

**Stage 3:** Each user sends a random vote (/api/vote) and continues polling /api/votingstatus until the voting period ends (10 seconds).

**Stage 4:** A single admin user sends a GET request to /api/getresult and checks that the total votes equal the number of voters.

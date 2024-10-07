Single page responsive voting app with a simple API implemented in Next.js, inspired by (but not affiliated with) the voting system of the Ukrainian parliament "Rada".

## Install the dependencies

```bash
npm install --registry https://registry.npmjs.org
```

## Start the development server

```bash
npm run dev
```

## Build the production version

```bash
npm run build
```

## Start the production server

```bash
npm run start
```

Optional: Serve on a Different Port

```bash
PORT=4000 npm run start
```

## How to vote and view the voting results

Each participant should go to http://localhost:3000, wait for the voting to start and then vote. The latest voting results can be viewed on a separate screen http://localhost:3000/result

## API

**Start new voting process with a 10 sec timer (this is the default duration):**

```bash
curl -X POST http://localhost:3000/api/startvote
```

**Start new voting process with a 15 sec timer:**

```bash
curl -X POST http://localhost:3000/api/startvote -H "Content-Type: application/json" -d '{"duration": 15}'
```

**Get voting results:**

```bash
curl http://localhost:3000/api/getresult
```

**Reset all votes:**

```bash
curl -X POST http://localhost:3000/api/resetvotes
```

**Set recess status (a break during the parliamentary session), this is used for displaying a message on result page, false by default**

```bash
curl -X POST http://localhost:3000/api/setrecess -H "Content-Type: application/json" -d '{"status": true}'

curl -X POST http://localhost:3000/api/setrecess -H "Content-Type: application/json" -d '{"status": false}'
```

Example response:

```json
{"yes":51, "abstain":3, "no":10}
```

**Get voting status:**

```bash
curl http://localhost:3000/api/votingstatus
```

Example response:

```json
{"is_active":1, "time_remaining":5}
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

### Load Test Scenario

**Key Points:**

*Voters:* Controlled via VOTERS environment variable (default is 100).

*Hostname:* Configurable via HOSTNAME environment variable (default is localhost:3000).

**Stage 1:** Each user polls /api/votingstatus every second for 30 seconds.

**Stage 2:** A single admin user sends a POST request to /api/startvote to start voting.

**Stage 3:** Each user sends a random vote (/api/vote) and continues polling /api/votingstatus until the voting period ends (10 seconds).

**Stage 4:** A single admin user sends a GET request to /api/getresult and checks that the total votes equal the number of voters.

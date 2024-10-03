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

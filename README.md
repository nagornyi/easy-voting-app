Single-page responsive voting app with a simple API that is implemented in Next.js, it is inspired by Ukraine's Parliament "Rada" voting system (but not affiliated to it).

## Install dependencies

```bash
npm install --registry https://registry.npmjs.org
```

## Run the server

```bash
npm run dev
```

## API

Start new voting process with a 10 sec timer (this is the default duration):

```bash
curl -X POST http://localhost:3000/api/startvote
```

Start new voting process with a 15 sec timer:

```bash
curl -X POST http://localhost:3000/api/startvote -H "Content-Type: application/json" -d '{"duration": 15}'
```

Get voting results:

```bash
curl http://localhost:3000/api/getresult
```

Example response:

```json
{"yes":51,"abstain":3,"no":10}
```

Get voting status:

```bash
curl http://localhost:3000/api/votingstatus
```

Example response:

```json
{"is_active":1,"time_remaining":5}
```

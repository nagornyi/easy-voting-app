Single-page voting app with simple API that is implemented in Next.js, it is inspired by Ukrainian Rada system.

## Run the server

```bash
npm run dev
```

## API

Start new voting process with a 10 sec timer:

```bash
curl -X POST http://localhost:3000/api/startvote
```

Get voting results in JSON format:

```bash
curl http://localhost:3000/api/getresult
```

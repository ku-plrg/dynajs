// Log server for the trace build (dist/dse-dynajs-trace.js): appends each POSTed
// progress report as one JSON line.   node tracelog.mjs [port 8398] [file]
import http from 'node:http';
import fs from 'node:fs';
const port = Number(process.argv[2] ?? 8398);
const file = process.argv[3] ?? '/tmp/dynajs-trace.jsonl';
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
http
  .createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (req.method === 'POST') fs.appendFileSync(file, Buffer.concat(chunks).toString('utf8') + '\n');
      res.writeHead(200, cors);
      res.end('ok');
    });
  })
  .listen(port, '127.0.0.1');

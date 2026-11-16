// DynaJS instrumentation service for SWIPE's mitmproxy addon (proxy.py,
// instrumenter=dynajs). One long-lived process, so instrumentation ids keep
// increasing across every script of every page and never collide in D$.ids
// (code instrumented in the browser via eval counts down from -1).
//
//   node instrument-server.mjs [--port 8399] [--log /tmp/dynajs-instrument.jsonl]
//                              [--hooks cb1,cb2,...] [--no-cache]
//
// --hooks: partial mode — only the runtime hooks for these analysis callbacks
//   (default: full mode). The proxy never loads the analysis, so the caller
//   passes its callback list (run-swipe.sh, per analysis).
// Results are cached by content hash (as SWIPE caches Jalangi's output per
// host + MD5): DSE visits reload the same scripts.
//
// POST /instrument  {"code": str, "label": str, "kind": "script" | "handler"}
//   200 -> instrumented code (text)      422 -> instrumentation failed (JSON error)
// "handler" code is an inline event-handler body (may contain `return`): it is
// instrumented as `(function (event) { BODY })` and returned as an attribute
// value that calls that function with the handler's `this` and `event`.
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { instrument } from '../dist/instrument.mjs';
import { makeHint } from './hint.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : d;
};
const port = Number(opt('--port', 8399));
const logPath = opt('--log', '/tmp/dynajs-instrument.jsonl');
const hooks = opt('--hooks', undefined);
const useCache = !argv.includes('--no-cache');

const callbackHint = makeHint(hooks); // undefined = full mode
const cache = new Map(); // sha256(kind, code) -> { out, module }

function log(entry) {
  fs.appendFileSync(logPath, JSON.stringify({ time: new Date().toISOString(), ...entry }) + '\n');
}

const MODULE_SYNTAX = /'import' and 'export' may appear only|'import\.meta' outside a module/;

function instrumentScript(code, label, allowModule = false) {
  const opts = {
    pos: undefined,
    callbackHint,
    isScript: true,
    globalLexical: true, // classic scripts share the global lexical scope
    originalPath: label,
  };
  try {
    return { out: instrument(code, opts), module: false };
  } catch (e) {
    // The proxy only sees a JavaScript response, not whether it was loaded by
    // <script type="module"> / import: retry module syntax as a module.
    if (!allowModule || !MODULE_SYNTAX.test(String(e && e.message))) throw e;
    return { out: instrument(code, { ...opts, isScript: false, globalLexical: false }), module: true };
  }
}

function instrumentHandler(body, label) {
  // An instrumented program is a statement list, so it cannot evaluate to the
  // handler function; it stores it in D$.__h instead and the attribute calls it
  // right away. The function expression is still created inside the
  // attribute's own scope chain (element/form/document `with` scopes).
  const { out } = instrumentScript(`D$.__h = function (event) {\n${body}\n};`, label);
  return { out: `${out}\nreturn D$.__h.call(this, event);`, module: false };
}

http
  .createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/instrument') {
      res.writeHead(404);
      return res.end();
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      let label = '?';
      let kind = 'script';
      const start = process.hrtime.bigint();
      try {
        const msg = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        label = msg.label ?? '?';
        kind = msg.kind ?? 'script';
        const key = useCache && crypto.createHash('sha256').update(kind).update('\0').update(msg.code).digest('hex');
        let hit = key && cache.get(key);
        const { out, module } =
          hit ??
          (kind === 'handler' ? instrumentHandler(msg.code, label) : instrumentScript(msg.code, label, true));
        if (key && !hit) cache.set(key, { out, module });
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        log({ ok: true, kind, label, bytes: msg.code.length, ms, ...(module && { module }), ...(hit && { cached: true }) });
        res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
        res.end(out);
      } catch (e) {
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        // JSON served with a JavaScript content type is not a script: record it
        // separately so it is not counted as an instrumentation failure
        let isJson = false;
        try {
          JSON.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')).code);
          isJson = true;
        } catch {}
        log({ ok: false, json: isJson, kind, label, ms, error: String(e && e.message) });
        res.writeHead(422, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: String(e && e.message) }));
      }
    });
  })
  .listen(port, '127.0.0.1', () => console.log(`dynajs instrument server on 127.0.0.1:${port}`));

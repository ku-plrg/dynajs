// Local harness: serves SWIPE test pages with every inline <script> instrumented
// by DynaJS, and injects the DynaJS runtime + an analysis bundle at the top.
//
//   node bench/swipe/harness/serve.mjs <pages-dir> [--port 8770] [--analysis dist/pse-dynajs.js] [--bare]
//
// --bare serves pages without instrumentation (baseline). Instrumentation
// errors are logged and counted at /__stats.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { instrument } from '../dist/instrument.mjs';
import { makeHint } from '../proxy/hint.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : d;
};
const root = path.resolve(argv[0] ?? '.');
const port = Number(opt('--port', 8770));
const analysis = path.resolve(here, '..', opt('--analysis', 'dist/pse-dynajs.js'));
const callbackHint = makeHint(opt('--hooks', undefined)); // --hooks a,b,c: partial mode
const bare = argv.includes('--bare');
const runtime = path.resolve(here, '../dist/dynajs-runtime.js');
const xhrShim = path.resolve(here, 'xhr-shim.js');

const stats = { scripts: 0, failed: 0, failures: [] };

function instrumentScript(code, label) {
  stats.scripts++;
  try {
    return instrument(code, {
      pos: undefined,
      callbackHint,
      isScript: true,
      globalLexical: true, // classic scripts share the global lexical scope
      originalPath: label,
    });
  } catch (e) {
    stats.failed++;
    stats.failures.push({ label, error: String(e && e.message) });
    console.error(`[instrument] ${label}: ${e && e.message}`);
    return code;
  }
}

function rewriteHtml(html, url) {
  let n = 0;
  const body = html.replace(
    /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi,
    (all, attrs = '', code) => {
      if (/\bsrc\s*=/.test(attrs) || !code.trim()) return all;
      if (/type\s*=\s*["']?(?!text\/javascript|application\/javascript)/i.test(attrs)) return all;
      const out = instrumentScript(code, `${url}#inline-${n++}`);
      return `<script${attrs}>${out.replace(/<\/script/gi, '<\\/script')}</script>`;
    },
  );
  const head =
    '<script src="/__swipe/xhr-shim.js"></script>' +
    '<script src="/__swipe/dynajs-runtime.js"></script>' +
    '<script src="/__swipe/analysis.js"></script>';
  return head + body;
}

const send = (res, code, type, body) => {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

http
  .createServer((req, res) => {
    const u = new URL(req.url, `http://${req.headers.host}`);
    if (u.pathname === '/__stats') return send(res, 200, 'application/json', JSON.stringify(stats));
    if (u.pathname === '/__driver') return send(res, 200, 'text/html', fs.readFileSync(path.join(here, 'driver.html')));
    if (u.pathname === '/__tests') {
      const tests = fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, 'index.html'))).sort();
      return send(res, 200, 'application/json', JSON.stringify(tests));
    }
    if (u.pathname === '/__swipe/dynajs-runtime.js') return send(res, 200, 'text/javascript', fs.readFileSync(runtime));
    if (u.pathname === '/__swipe/analysis.js') return send(res, 200, 'text/javascript', fs.readFileSync(analysis));
    if (u.pathname === '/__swipe/xhr-shim.js') return send(res, 200, 'text/javascript', fs.readFileSync(xhrShim));
    let file = path.join(root, decodeURIComponent(u.pathname));
    if (!file.startsWith(root)) return send(res, 403, 'text/plain', 'forbidden');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return send(res, 404, 'text/plain', 'not found');
    const src = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.html')) return send(res, 200, 'text/html', bare ? src : rewriteHtml(src, u.pathname));
    if (file.endsWith('.js')) return send(res, 200, 'text/javascript', bare ? src : instrumentScript(src, u.pathname));
    return send(res, 200, 'application/octet-stream', fs.readFileSync(file));
  })
  .listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}${bare ? ' (bare)' : ''}`));

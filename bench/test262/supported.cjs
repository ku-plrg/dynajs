#!/usr/bin/env node
'use strict';

// Run test262 only for the built-ins DynaJS models (analyses/flow Model.BUILTINS),
// and attribute every failure.
//
// Steps (each a subcommand; `all` runs them in order):
//   select   ask the model-check analysis for the supported builtins, map each to
//            its test262 directories            -> <out>/selection.json
//   extract  inline harness includes via extract.cjs -> <out>/extracted/
//   run      run the extracted files three times via run.cjs -> <out>/results/
//              node      plain node (engine baseline)
//              bare      djx -p noop-nobuiltin (instrumentation only, models off)
//              model     djx -p model-check (every supported call runs its model,
//                        including .call/.apply/Reflect.apply), recording which
//                        models ran per file -> <out>/results/hits.jsonl
//   report   join the three runs, the hits and the selection
//                                       -> <out>/report.json, <out>/report.md
//
// A test counts toward a builtin's conformance only if node and bare pass it and
// the model of that builtin actually ran in the test (harness-only hits excluded
// by name). Tests like name.js / length.js / prop-desc.js never call the builtin
// and are reported separately as "model not exercised".

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const HERE = __dirname;
const ROOT = path.resolve(HERE, '..', '..'); // dynajs repo root (instrumentation include root)
const DJX = path.join(ROOT, 'djx');

const RUNNERS = {
  node: 'node',
  bare: `${DJX} run -p noop-nobuiltin -- node`,
  model: `${DJX} run -p model-check -- node`,
};

function parseArgs() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('supported.cjs')
    .usage('Usage: $0 <select|extract|run|report|all> [options]')
    .command('select', 'map supported builtins to test262 paths')
    .command('extract', 'extract the selected tests')
    .command('run', 'run node / bare / model over the extracted tests')
    .command('report', 'join the runs into report.json / report.md')
    .command('all', 'select + extract + run + report')
    .demandCommand(1)
    .option('test262', {
      type: 'string',
      default:
        process.env.TEST262_DIR ||
        path.join(os.homedir(), 'code', 'esmeta', 'tests', 'test262'),
      defaultDescription: '$TEST262_DIR or ~/code/esmeta/tests/test262',
    })
    .option('out', {
      type: 'string',
      default: path.join(HERE, 'supported'),
      describe: 'output directory (must stay under the dynajs root so djx instruments it)',
    })
    .option('only', {
      type: 'string',
      describe: 'regex on builtin path (e.g. "^String\\.prototype\\.pad") to restrict select',
    })
    .option('runners', {
      type: 'string',
      default: 'node,bare,model',
      describe: 'comma-separated subset of node,bare,model for `run`',
    })
    .option('jobs', { type: 'number', alias: 'j', default: os.cpus().length || 4 })
    .option('timeout', { type: 'number', default: 20000 })
    .help()
    .alias('h', 'help')
    .strict()
    .parse();
  return {
    cmd: String(argv._[0]),
    test262: path.resolve(argv.test262),
    out: path.resolve(argv.out),
    only: argv.only ? new RegExp(argv.only) : null,
    runners: argv.runners.split(',').map((s) => s.trim()).filter(Boolean),
    jobs: argv.jobs,
    timeout: argv.timeout,
  };
}

const env = () => ({ ...process.env, DYNAJS_HOME: ROOT });

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ---------------------------------------------------------------- select

// "String.prototype.at" -> ["built-ins/String/prototype/at", "annexB/built-ins/String/prototype/at"]
function candidateDirs(p) {
  const parts = p.split('.');
  const rel = parts.join('/');
  return [`built-ins/${rel}`, `annexB/built-ins/${rel}`];
}

function select(opts) {
  const out = execFileSync(DJX, ['run', '-p', 'model-check', '--', 'node', '-e', ''], {
    cwd: ROOT,
    env: { ...env(), MODEL_CHECK_LIST: '1' },
    encoding: 'utf8',
  });
  const listing = JSON.parse(out);
  const testRoot = path.join(opts.test262, 'test');
  const builtins = {};
  const unmapped = [];
  for (const b of listing.supported) {
    if (opts.only && !opts.only.test(b)) continue;
    const names = [b, ...(listing.aliases[b] || [])];
    const paths = [];
    for (const n of names) {
      if (!n.includes('.')) {
        // A constructor itself (e.g. `String`): only the top-level files of its
        // directory; subdirectories belong to its methods.
        const dir = path.join(testRoot, 'built-ins', n);
        if (fs.existsSync(dir)) {
          for (const f of fs.readdirSync(dir).sort()) {
            if (f.endsWith('.js') && !f.includes('_FIXTURE')) {
              paths.push(`test/built-ins/${n}/${f}`);
            }
          }
        }
        continue;
      }
      for (const d of candidateDirs(n)) {
        if (fs.existsSync(path.join(testRoot, d))) paths.push(`test/${d}`);
      }
    }
    if (paths.length === 0) unmapped.push(b);
    builtins[b] = paths;
  }
  const selection = {
    test262: opts.test262,
    test262Commit: gitHead(opts.test262),
    created: new Date().toISOString(),
    supported: listing.supported,
    aliases: listing.aliases,
    builtins,
    unmapped,
  };
  fs.mkdirSync(opts.out, { recursive: true });
  fs.writeFileSync(path.join(opts.out, 'selection.json'), JSON.stringify(selection, null, 2) + '\n');
  const nPaths = Object.values(builtins).reduce((a, ps) => a + ps.length, 0);
  console.log(
    `select: ${Object.keys(builtins).length} builtins, ${nPaths} test262 paths` +
      (unmapped.length ? `, unmapped: ${unmapped.join(', ')}` : ''),
  );
}

function gitHead(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- extract

function extract(opts) {
  const sel = readJSON(path.join(opts.out, 'selection.json'));
  const paths = [...new Set(Object.values(sel.builtins).flat())];
  const dir = path.join(opts.out, 'extracted');
  fs.rmSync(dir, { recursive: true, force: true });
  // test262-stream takes the paths on argv; chunk to stay under ARG_MAX.
  const manifest = [];
  const CHUNK = 400;
  for (let i = 0; i < paths.length; i += CHUNK) {
    const tmp = path.join(opts.out, `.extract-${i}`);
    run('node', [path.join(HERE, 'extract.cjs'), '--test262', opts.test262, '--out', tmp, ...paths.slice(i, i + CHUNK)]);
    copyTree(tmp, dir);
    manifest.push(fs.readFileSync(path.join(tmp, 'manifest.jsonl'), 'utf8'));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  fs.writeFileSync(path.join(dir, 'manifest.jsonl'), manifest.join(''));
  const n = manifest.join('').split('\n').filter(Boolean).length;
  console.log(`extract: ${n} files -> ${path.relative(ROOT, dir)}`);
}

function copyTree(src, dst) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name === 'manifest.jsonl') continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyTree(s, d);
    else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function run(cmd, args, extraEnv = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, env: { ...env(), ...extraEnv }, stdio: 'inherit' });
  if (r.error) throw r.error;
  return r.status;
}

// ---------------------------------------------------------------- run

function runAll(opts) {
  const dir = path.join(opts.out, 'extracted');
  const resDir = path.join(opts.out, 'results');
  fs.mkdirSync(resDir, { recursive: true });
  for (const name of opts.runners) {
    const runner = RUNNERS[name];
    if (!runner) throw new Error(`unknown runner '${name}' (node|bare|model)`);
    const extraEnv = {};
    if (name === 'model') {
      const hits = path.join(resDir, 'hits.jsonl');
      fs.rmSync(hits, { force: true });
      extraEnv.MODEL_CHECK_HITS = hits;
    }
    console.log(`\n=== run: ${name} (${runner}) ===`);
    // run.cjs exits 1 when anything fails; that is expected here.
    run(
      'node',
      [
        path.join(HERE, 'run.cjs'),
        '--dir', dir,
        '--runner', runner,
        '--jobs', String(opts.jobs),
        '--timeout', String(opts.timeout),
        '--quiet', '--no-verbose',
        '--json', path.join(resDir, `${name}.json`),
      ],
      extraEnv,
    );
  }
}

// ---------------------------------------------------------------- report

function loadVerdicts(p) {
  if (!fs.existsSync(p)) return null;
  const doc = readJSON(p);
  const m = new Map();
  for (const r of doc.results) m.set(r.file, r);
  return m;
}

function report(opts) {
  const sel = readJSON(path.join(opts.out, 'selection.json'));
  const dir = path.join(opts.out, 'extracted');
  const resDir = path.join(opts.out, 'results');
  const node = loadVerdicts(path.join(resDir, 'node.json'));
  const bare = loadVerdicts(path.join(resDir, 'bare.json'));
  const model = loadVerdicts(path.join(resDir, 'model.json'));
  if (!node || !bare || !model) throw new Error('missing results; run `run` first');

  const hits = new Map();
  const hitsFile = path.join(resDir, 'hits.jsonl');
  if (fs.existsSync(hitsFile)) {
    for (const line of fs.readFileSync(hitsFile, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      const r = JSON.parse(line);
      hits.set(path.relative(dir, r.file).split(path.sep).join('/'), new Set(r.hits));
    }
  }

  // Extracted file (relative, ".strict.js" for the strict scenario) -> builtin,
  // by the longest selected test262 path that owns its source.
  const owners = [];
  for (const [b, ps] of Object.entries(sel.builtins)) for (const p of ps) owners.push([p, b]);
  owners.sort((a, b) => b[0].length - a[0].length);
  const manifest = fs
    .readFileSync(path.join(dir, 'manifest.jsonl'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  const V = (m, f) => (m.get(f) || { verdict: 'MISSING' }).verdict;
  const rows = {};
  const tests = [];
  for (const rec of manifest) {
    const owner = owners.find(([p]) => rec.source === p || rec.source.startsWith(p + '/'));
    if (!owner) continue;
    const b = owner[1];
    const n = V(node, rec.file);
    const br = V(bare, rec.file);
    const mo = V(model, rec.file);
    const hit = (hits.get(rec.file) || new Set()).has(b);
    let cls;
    if (n !== 'PASS') cls = 'engine-fail';
    else if (br !== 'PASS') cls = 'instr-fail';
    else if (!hit) cls = mo === 'PASS' ? 'not-exercised' : 'fail-not-exercised';
    else cls = mo === 'PASS' ? 'pass' : 'model-fail';
    const row = (rows[b] ||= {
      total: 0, 'engine-fail': 0, 'instr-fail': 0, 'not-exercised': 0,
      'fail-not-exercised': 0, pass: 0, 'model-fail': 0,
    });
    row.total += 1;
    row[cls] += 1;
    tests.push({
      file: rec.file,
      builtin: b,
      node: n,
      bare: br,
      model: mo,
      hit,
      cls,
      detail: cls.includes('fail') ? (model.get(rec.file) || {}).detail || '' : undefined,
    });
  }

  const sum = { total: 0, 'engine-fail': 0, 'instr-fail': 0, 'not-exercised': 0, 'fail-not-exercised': 0, pass: 0, 'model-fail': 0 };
  for (const r of Object.values(rows)) for (const k of Object.keys(sum)) sum[k] += r[k];

  const doc = {
    meta: {
      created: new Date().toISOString(),
      test262: sel.test262,
      test262Commit: sel.test262Commit,
      runners: RUNNERS,
      unmapped: sel.unmapped,
    },
    summary: sum,
    builtins: rows,
    failures: tests.filter((t) => t.cls === 'model-fail' || t.cls === 'fail-not-exercised' || t.cls === 'instr-fail'),
  };
  fs.writeFileSync(path.join(opts.out, 'report.json'), JSON.stringify(doc, null, 1) + '\n');
  fs.writeFileSync(path.join(opts.out, 'tests.jsonl'), tests.map((t) => JSON.stringify(t)).join('\n') + '\n');

  const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + '%' : '-');
  const lines = [];
  lines.push('# test262 on DynaJS spec models', '');
  lines.push(`test262 ${sel.test262Commit || '?'} · ${new Date().toISOString()}`, '');
  lines.push('Columns: engine-fail = plain node fails (excluded); instr-fail = node passes but instrumentation-only (noop-nobuiltin) fails; ' +
    'not-exercised = the builtin\'s model never ran (e.g. length/name/prop-desc tests); ' +
    'fail-not-exercised = model run fails without that model running (another model or dispatch); ' +
    'conformance = pass / (pass + model-fail).', '');
  lines.push('| builtin | total | engine-fail | instr-fail | not-exercised | fail-not-exercised | pass | model-fail | conformance |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  const fmtRow = (name, r) =>
    `| ${name} | ${r.total} | ${r['engine-fail']} | ${r['instr-fail']} | ${r['not-exercised']} | ${r['fail-not-exercised']} | ${r.pass} | ${r['model-fail']} | ${pct(r.pass, r.pass + r['model-fail'])} |`;
  for (const b of Object.keys(rows).sort()) lines.push(fmtRow(b, rows[b]));
  lines.push(fmtRow('**total**', sum), '');
  if (sel.unmapped.length) lines.push(`Supported but no test262 directory: ${sel.unmapped.join(', ')}`, '');
  const fails = doc.failures.filter((t) => t.cls !== 'instr-fail');
  if (fails.length) {
    lines.push('## Model-run failures', '');
    for (const t of fails) lines.push(`- \`${t.file}\` (${t.cls}) ${t.detail ? '— ' + t.detail.replace(/\|/g, '\\|') : ''}`);
    lines.push('');
  }
  const instr = doc.failures.filter((t) => t.cls === 'instr-fail');
  if (instr.length) {
    lines.push('## Instrumentation-only failures (not model bugs)', '');
    for (const t of instr) lines.push(`- \`${t.file}\``);
    lines.push('');
  }
  fs.writeFileSync(path.join(opts.out, 'report.md'), lines.join('\n'));
  console.log(
    `report: ${sum.total} tests | pass ${sum.pass} | model-fail ${sum['model-fail']} | not-exercised ${sum['not-exercised']} | ` +
      `fail-not-exercised ${sum['fail-not-exercised']} | instr-fail ${sum['instr-fail']} | engine-fail ${sum['engine-fail']} | ` +
      `conformance ${pct(sum.pass, sum.pass + sum['model-fail'])}`,
  );
  console.log(`       ${path.relative(ROOT, path.join(opts.out, 'report.md'))}`);
}

// ---------------------------------------------------------------- main

function main() {
  const opts = parseArgs();
  if (!opts.out.startsWith(ROOT + path.sep)) {
    throw new Error(`--out must be under ${ROOT} (djx only instruments files under its cwd)`);
  }
  const steps = {
    select: () => select(opts),
    extract: () => extract(opts),
    run: () => runAll(opts),
    report: () => report(opts),
  };
  if (opts.cmd === 'all') for (const s of Object.values(steps)) s();
  else if (steps[opts.cmd]) steps[opts.cmd]();
  else throw new Error(`unknown command ${opts.cmd}`);
}

main();

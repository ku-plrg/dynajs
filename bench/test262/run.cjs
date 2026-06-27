#!/usr/bin/env node
'use strict';

// Runs extracted test262 files (see extract.cjs) through a given runner command
// and reports PASS / FAIL / TIMEOUT per file using a simple exit-code rule:
//   exit 0        -> PASS
//   exit != 0     -> FAIL
//   over timeout  -> TIMEOUT (the process group is killed)
//
// Note: test262 NEGATIVE tests intentionally throw (exit != 0) and so show as
// FAIL here. That is by design for this tool -- the exit-code rule is meant for
// "did this file run clean?" and for spotting instrumentation regressions
// (exit 0 under plain `node`, non-zero under djx). For spec-accurate verdicts,
// consult <dir>/manifest.jsonl (negative / async / flags).
//
// Usage:
//   node bench/test262/run.cjs [options] [path-prefix...]
//
//   --dir <dir>       extracted files directory (default: ./test262-extracted)
//   --runner <cmd>    runner command prefix; the file path is appended, or
//                     substituted for a `{}` / `{file}` placeholder.
//                     (default: "node")
//   --filter <regex>  JS regex matched against each file's relative posix path;
//                     repeatable (OR). Positional args are path prefixes (OR).
//   --timeout <ms>    per-file timeout; group-killed on exceed (default: 10000)
//   --jobs <n>        parallel workers (default: number of CPUs)
//   --quiet           print only FAIL / TIMEOUT lines (plus the summary)
//
// Examples:
//   node bench/test262/run.cjs --runner "node" built-ins/Array
//   node bench/test262/run.cjs --dir ./out \
//     --runner "djx run -p noop --include $PWD/out -- node" --filter 'Array/.*length'

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

function parseArgs(argv) {
  const opts = {
    dir: path.resolve(process.cwd(), 'test262-extracted'),
    runner: 'node',
    filters: [],
    prefixes: [],
    timeout: 10000,
    jobs: os.cpus().length || 4,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') opts.dir = path.resolve(argv[++i]);
    else if (a === '--runner') opts.runner = argv[++i];
    else if (a === '--filter') opts.filters.push(new RegExp(argv[++i]));
    else if (a === '--timeout') opts.timeout = Number(argv[++i]);
    else if (a === '--jobs' || a === '-j') opts.jobs = Math.max(1, Number(argv[++i]));
    else if (a === '--quiet' || a === '-q') opts.quiet = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else opts.prefixes.push(a.replace(/\\/g, '/').replace(/^\.?\//, ''));
  }
  return opts;
}

// Recursively collect *.js files (skip manifest.jsonl), returning posix-relative
// paths sorted for stable output.
function collectFiles(root) {
  const out = [];
  const walk = (abs, rel) => {
    let entries;
    try {
      entries = fs.readdirSync(abs, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const childAbs = path.join(abs, e.name);
      const childRel = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(childAbs, childRel);
      else if (e.isFile() && e.name.endsWith('.js')) out.push(childRel);
    }
  };
  walk(root, '');
  return out.sort();
}

function matches(rel, opts) {
  if (opts.prefixes.length && !opts.prefixes.some((p) => rel.startsWith(p))) {
    return false;
  }
  if (opts.filters.length && !opts.filters.some((re) => re.test(rel))) {
    return false;
  }
  return true;
}

function buildArgv(runner, file) {
  const parts = runner.trim().split(/\s+/).filter(Boolean);
  let used = false;
  const argv = parts.map((p) => {
    if (p === '{}' || p === '{file}') {
      used = true;
      return file;
    }
    return p;
  });
  if (!used) argv.push(file);
  return argv;
}

// Run one file; resolve to 'PASS' | 'FAIL' | 'TIMEOUT' with details.
function runOne(absFile, opts) {
  return new Promise((resolve) => {
    const argv = buildArgv(opts.runner, absFile);
    const child = spawn(argv[0], argv.slice(1), {
      detached: true, // own process group, so a timeout can kill children too
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let stderr = '';
    child.stderr.on('data', (d) => {
      if (stderr.length < 2048) stderr += d.toString();
    });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        try {
          child.kill('SIGKILL');
        } catch {
          // already gone
        }
      }
    }, opts.timeout);

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ verdict: 'FAIL', detail: `spawn error: ${err.message}` });
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return resolve({ verdict: 'TIMEOUT', detail: '' });
      if (code === 0) return resolve({ verdict: 'PASS', detail: '' });
      const first = stderr.split('\n').find((l) => l.trim());
      const why = signal ? `signal ${signal}` : `exit ${code}`;
      return resolve({ verdict: 'FAIL', detail: `${why}${first ? ' | ' + first.trim() : ''}` });
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(
      fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 38).join('\n') + '\n',
    );
    return;
  }

  const all = collectFiles(opts.dir);
  const files = all.filter((rel) => matches(rel, opts));

  const started = new Date();
  process.stdout.write(`start: ${started.toISOString()}\n`);
  process.stdout.write(
    `dir: ${opts.dir} | runner: ${opts.runner} | files: ${files.length}/${all.length} | jobs: ${opts.jobs} | timeout: ${opts.timeout}ms\n`,
  );

  const counts = { PASS: 0, FAIL: 0, TIMEOUT: 0 };
  let next = 0;

  async function worker() {
    while (next < files.length) {
      const rel = files[next++];
      const res = await runOne(path.join(opts.dir, rel), opts);
      counts[res.verdict] += 1;
      if (!opts.quiet || res.verdict !== 'PASS') {
        const tail = res.detail ? ` (${res.detail})` : '';
        process.stdout.write(`${res.verdict} ${rel}${tail}\n`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(opts.jobs, files.length || 1) }, worker),
  );

  const ended = new Date();
  const secs = ((ended - started) / 1000).toFixed(1);
  process.stdout.write(`end:   ${ended.toISOString()}  (${secs}s)\n`);
  process.stdout.write(
    `total ${files.length} | PASS ${counts.PASS} | FAIL ${counts.FAIL} | TIMEOUT ${counts.TIMEOUT}\n`,
  );

  process.exitCode = counts.FAIL || counts.TIMEOUT ? 1 : 0;
}

main();

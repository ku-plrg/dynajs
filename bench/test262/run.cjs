#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

function parseArgs() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('run.cjs')
    .usage(
      'Usage: $0 [options] [path-prefix...]\n\nRun extracted test262 files through a runner; PASS/FAIL/TIMEOUT by exit code',
    )
    .option('dir', {
      type: 'string',
      default: 'bench/test262/extracted',
      describe: 'extracted files directory',
    })
    .option('runner', {
      type: 'string',
      default: 'node',
      describe:
        'runner command prefix; the file path is appended, or substituted for a `{}` / `{file}` placeholder',
    })
    .option('filter', {
      type: 'string',
      describe:
        'JS regex matched against each file’s relative posix path (repeatable, OR)',
    })
    .option('timeout', {
      type: 'number',
      default: 10000,
      describe: 'per-file timeout in ms; the process group is killed on exceed',
    })
    .option('jobs', {
      type: 'number',
      alias: 'j',
      default: os.cpus().length || 4,
      describe: 'parallel workers',
    })
    .option('quiet', {
      type: 'boolean',
      alias: 'q',
      default: false,
      describe: 'print only FAIL / TIMEOUT lines (plus the summary)',
    })
    .epilogue(
      'Positional [path-prefix...] restrict to files whose relative path starts with one of them (OR).',
    )
    .help()
    .alias('h', 'help')
    .strictOptions()
    .parse();

  return {
    dir: path.resolve(argv.dir),
    runner: argv.runner,
    filters: [].concat(argv.filter ?? []).map((s) => new RegExp(String(s))),
    prefixes: argv._.map((a) =>
      String(a).replace(/\\/g, '/').replace(/^\.?\//, ''),
    ),
    timeout: argv.timeout,
    jobs: Math.max(1, argv.jobs),
    quiet: argv.quiet,
  };
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
  const opts = parseArgs();

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

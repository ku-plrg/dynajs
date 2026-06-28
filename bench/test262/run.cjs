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
    .option('verbose', {
      type: 'boolean',
      alias: 'v',
      default: true,
      describe:
        'on FAIL/TIMEOUT, also dump the full captured stderr (and stdout) indented, for debugging',
    })
    .option('json', {
      type: 'string',
      describe:
        'also write a machine-readable report here (meta + counts + per-file {file,verdict,detail}); one result per line, PASS included, regardless of --quiet',
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
    verbose: argv.verbose,
    json: argv.json ? path.resolve(argv.json) : null,
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
      // Skip dynajs's in-place instrumented artifacts (`*__dynajs__.js`), which
      // djx writes next to each source when the extracted dir is an --include
      // root; they are not tests and crash under plain `node` (no D$ runtime).
      else if (
        e.isFile() &&
        e.name.endsWith('.js') &&
        !e.name.endsWith('__dynajs__.js')
      ) {
        out.push(childRel);
      }
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

const OUTPUT_CAP = 64 * 1024;

// Pick the most informative line for the one-line FAIL detail: prefer a line
// naming an error (RangeError / TypeError / Test262Error / ...), since the first
// stderr line is usually just `file:line`. Fall back to the last non-empty line.
function errorLine(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return '';
  const errIdx = lines.findIndex((l) => /\b[A-Za-z]*Error\b/.test(l));
  return errIdx >= 0 ? lines[errIdx] : lines[lines.length - 1];
}

// Run one file; resolve to { verdict, detail, output } where verdict is
// 'PASS' | 'FAIL' | 'TIMEOUT', detail is a one-line reason, and output is the
// full captured stderr (+ stdout) for --verbose.
function runOne(absFile, opts) {
  return new Promise((resolve) => {
    const argv = buildArgv(opts.runner, absFile);
    const child = spawn(argv[0], argv.slice(1), {
      detached: true, // own process group, so a timeout can kill children too
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      if (stdout.length < OUTPUT_CAP) stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      if (stderr.length < OUTPUT_CAP) stderr += d.toString();
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

    const fullOutput = () => {
      const parts = [];
      if (stderr.trim()) parts.push(stderr.replace(/\s+$/, ''));
      if (stdout.trim()) parts.push('--- stdout ---\n' + stdout.replace(/\s+$/, ''));
      return parts.join('\n');
    };

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ verdict: 'FAIL', detail: `spawn error: ${err.message}`, output: '' });
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        return resolve({
          verdict: 'TIMEOUT',
          detail: `killed after ${opts.timeout}ms`,
          output: fullOutput(),
        });
      }
      if (code === 0) return resolve({ verdict: 'PASS', detail: '', output: '' });
      const why = signal ? `signal ${signal}` : `exit ${code}`;
      const line = errorLine(stderr) || errorLine(stdout);
      return resolve({
        verdict: 'FAIL',
        detail: line ? `${why} | ${line}` : why,
        output: fullOutput(),
      });
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
  // When --json is set, hold one record per file at its sorted index so the
  // report stays in stable order despite parallel workers finishing out of order.
  const results = opts.json ? new Array(files.length) : null;
  let next = 0;

  async function worker() {
    while (next < files.length) {
      const i = next++;
      const rel = files[i];
      const res = await runOne(path.join(opts.dir, rel), opts);
      counts[res.verdict] += 1;
      if (results) {
        results[i] = { file: rel, verdict: res.verdict, detail: res.detail };
      }
      if (opts.quiet && res.verdict === 'PASS') continue;
      // Build the whole record as one string so parallel workers don't interleave.
      let block = `${res.verdict} ${rel}${res.detail ? ` (${res.detail})` : ''}\n`;
      if (opts.verbose && res.output) {
        block += res.output.split('\n').map((l) => '    ' + l).join('\n') + '\n';
      }
      process.stdout.write(block);
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

  if (opts.json) {
    const meta = {
      runner: opts.runner,
      dir: opts.dir,
      filters: opts.filters.map((re) => re.source),
      prefixes: opts.prefixes,
      timeout: opts.timeout,
      jobs: opts.jobs,
      start: started.toISOString(),
      end: ended.toISOString(),
      durationSec: Number(secs),
      total: files.length,
    };
    // meta/counts on one line each, then one result per line: valid JSON that
    // still greps and git-diffs cleanly across 100k+ rows.
    const doc =
      '{\n' +
      `"meta": ${JSON.stringify(meta)},\n` +
      `"counts": ${JSON.stringify(counts)},\n` +
      '"results": [\n' +
      results.map((r) => JSON.stringify(r)).join(',\n') +
      '\n]\n}\n';
    fs.mkdirSync(path.dirname(opts.json), { recursive: true });
    fs.writeFileSync(opts.json, doc);
    process.stdout.write(`json:  ${opts.json}\n`);
  }

  process.exitCode = counts.FAIL || counts.TIMEOUT ? 1 : 0;
}

main();

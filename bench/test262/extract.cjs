#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { execSync } = require('node:child_process');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

function resolveDep(name) {
  try {
    return require(name);
  } catch {
    // ignore
  }
  // Fall back to the (likely global) test262-harness install, which bundles
  // test262-stream in its own node_modules.
  try {
    const bin = execSync('command -v test262-harness', {
      encoding: 'utf8',
    }).trim();
    if (bin) {
      return createRequire(fs.realpathSync(bin))(name);
    }
  } catch {
    // ignore
  }
  throw new Error(
    `Could not resolve '${name}'. Install it, or ensure test262-harness is on PATH.`,
  );
}

const Test262Stream = resolveDep('test262-stream');

function parseArgs() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('extract.cjs')
    .usage(
      'Usage: $0 [options] [paths...]\n\nExtract test262 tests as standalone helper-inlined .js files',
    )
    .option('test262', {
      type: 'string',
      describe: 'test262 repo root',
      default: process.env.TEST262_DIR || path.join(os.homedir(), 'test262'),
      defaultDescription: '$TEST262_DIR or ~/test262',
    })
    .option('out', {
      type: 'string',
      describe: 'output directory',
      default: 'bench/test262/extracted',
    })
    .option('shim', {
      type: 'boolean',
      default: true,
      describe:
        'prepend print/$262 shim only when a test needs it (--no-shim for raw contents)',
    })
    .option('wrap', {
      type: 'boolean',
      default: false,
      describe:
        'run each test via vm.runInThisContext so top-level `this` is the global object (script semantics); same realm',
    })
    .epilogue(
      'Positional [paths...] are test paths relative to the test262 root (default: "test").',
    )
    .help()
    .alias('h', 'help')
    .strictOptions()
    .parse();

  return {
    test262: path.resolve(argv.test262),
    out: path.resolve(argv.out),
    shim: argv.shim,
    wrap: argv.wrap,
    paths: argv._.length ? argv._.map(String) : ['test'],
  };
}

const PRINT_SHIM = 'function print() { console.log.apply(console, arguments); }\n';

// Minimal single-realm $262. Enough for tests that only touch global/evalScript;
// createRealm is intentionally unsupported (the point of extraction is to run in
// ONE realm).
const SHIM_262 = [
  'var $262 = {',
  '  global: globalThis,',
  '  gc: function () {},',
  '  evalScript: function (code) { return (0, eval)(code); },',
  '  getGlobal: function (name) { return globalThis[name]; },',
  '  setGlobal: function (name, value) { globalThis[name] = value; },',
  '  detachArrayBuffer: function () { return undefined; },',
  '  createRealm: function () {',
  "    throw new Error('$262.createRealm is not supported in extracted (single-realm) mode');",
  '  },',
  '  IsHTMLDDA: function () { return undefined; },',
  '  agent: undefined,',
  '};\n',
].join('\n');

// Conditionally insert the shim at the test-body boundary (insertionIndex), so a
// leading "use strict" directive and the inlined includes stay above it.
function applyShim(test) {
  if (!test.attrs.flags.raw && typeof test.insertionIndex === 'number') {
    const idx = test.insertionIndex;
    const head = test.contents.slice(0, idx);
    const body = test.contents.slice(idx);

    let shim = '';
    const usesPrint = test.attrs.flags.async || /\bprint\s*\(/.test(body);
    const hasPrint = /function\s+print\b/.test(test.contents);
    if (usesPrint && !hasPrint) shim += PRINT_SHIM;

    const uses262 = /\$262/.test(body);
    const has262 = /(\bvar\s+\$262\b|\$262\s*=\s*\{)/.test(test.contents);
    if (uses262 && !has262) shim += SHIM_262;

    if (shim) return head + shim + body;
  }
  return test.contents;
}

// JSON.stringify leaves U+2028 / U+2029 unescaped, but they are invalid inside
// a JS string literal; escape them so the embedded source parses.
const LINE_SEP = new RegExp(String.fromCharCode(0x2028), 'g');
const PARA_SEP = new RegExp(String.fromCharCode(0x2029), 'g');

function wrapForGlobalThis(source) {
  const escaped = JSON.stringify(source)
    .replace(LINE_SEP, '\\u2028')
    .replace(PARA_SEP, '\\u2029');
  return (
    "require('node:vm').runInThisContext(" +
    escaped +
    ', { filename: __filename, displayErrors: true });\n'
  );
}

function outPathFor(test) {
  // test.file is like "test/built-ins/Array/S15.4.5.2_A3_T3.js"; drop the
  // leading "test/" segment and mirror the rest.
  let rel = test.file.replace(/\\/g, '/');
  rel = rel.replace(/^test\//, '');
  const base = rel.replace(/\.js$/, '');
  const suffix = test.scenario === 'strict mode' ? '.strict.js' : '.js';
  return base + suffix;
}

function main() {
  const opts = parseArgs();

  // test262-stream paths must be relative to the test262 root.
  const paths = opts.paths.map((p) => {
    const abs = path.resolve(p);
    return abs.startsWith(opts.test262 + path.sep)
      ? path.relative(opts.test262, abs)
      : p;
  });

  fs.mkdirSync(opts.out, { recursive: true });
  const manifestFd = fs.openSync(path.join(opts.out, 'manifest.jsonl'), 'w');

  let count = 0;
  const stream = new Test262Stream(opts.test262, {
    paths,
    includesDir: path.join(opts.test262, 'harness'),
  });

  stream.on('data', (test) => {
    const relOut = outPathFor(test);
    const dest = path.join(opts.out, relOut);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const source = opts.shim ? applyShim(test) : test.contents;
    fs.writeFileSync(dest, opts.wrap ? wrapForGlobalThis(source) : source);

    fs.writeSync(
      manifestFd,
      JSON.stringify({
        file: relOut,
        source: test.file,
        scenario: test.scenario,
        flags: test.attrs.flags,
        negative: test.attrs.negative || null,
      }) + '\n',
    );

    count += 1;
    if (count % 1000 === 0) process.stderr.write(`  ...${count} files\n`);
  });

  stream.on('error', (err) => {
    process.stderr.write(`error: ${err && err.stack ? err.stack : err}\n`);
    process.exitCode = 1;
  });

  stream.on('end', () => {
    fs.closeSync(manifestFd);
    process.stderr.write(
      `extracted ${count} files (incl. strict variants) to ${opts.out}\n`,
    );
  });
}

main();

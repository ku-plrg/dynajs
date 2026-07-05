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
    .option('features', {
      type: 'string',
      default: 'bench/test262/supported-features.json',
      describe:
        'supported-features file; extract only tests whose declared `features` are all listed (tests with no features always extracted). .json = array or {"features":[...]}; anything else = one feature per line, # comments. Pass "" to disable filtering.',
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
    features: argv.features ? path.resolve(argv.features) : null,
    paths: argv._.length ? argv._.map(String) : ['test'],
  };
}

// Load the supported-features allowlist. Returns a Set of feature names, or null
// (no file / disabled) to mean "no feature filtering". Two formats are accepted:
//   *.json  -> a JSON array of strings, or { "features": [...] }
//   *.txt   -> one feature per line; blank lines and `#...` comments are ignored
//              (same shape as test262's own features.txt, so comments are allowed)
function loadSupportedFeatures(featuresPath) {
  if (!featuresPath) return null;
  if (!fs.existsSync(featuresPath)) {
    process.stderr.write(
      `note: no supported-features file at ${featuresPath}; extracting all tests (feature filter disabled)\n`,
    );
    return null;
  }

  const raw = fs.readFileSync(featuresPath, 'utf8');
  let list;
  if (featuresPath.endsWith('.json')) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Could not parse ${featuresPath} as JSON: ${e.message}`);
    }
    list = Array.isArray(parsed) ? parsed : parsed && parsed.features;
    if (!Array.isArray(list)) {
      throw new Error(
        `${featuresPath} must be a JSON array of feature names, or an object with a "features" array`,
      );
    }
  } else {
    list = raw
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*$/, '').trim())
      .filter(Boolean);
  }

  return new Set(list.map(String));
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

  const supported = loadSupportedFeatures(opts.features);
  if (supported) {
    process.stderr.write(
      `filtering by ${supported.size} supported feature(s) from ${opts.features}\n`,
    );
  }

  fs.mkdirSync(opts.out, { recursive: true });
  const manifestFd = fs.openSync(path.join(opts.out, 'manifest.jsonl'), 'w');

  let count = 0;
  let skipped = 0;
  // feature name -> number of distinct source tests it blocked (deduped across
  // the default/strict scenarios of one file, so counts reflect real tests).
  const blockedByFeature = new Map();
  const blockedSources = new Set();

  const stream = new Test262Stream(opts.test262, {
    paths,
    includesDir: path.join(opts.test262, 'harness'),
  });

  stream.on('data', (test) => {
    const features = test.attrs.features || [];
    if (supported) {
      const unsupported = features.filter((f) => !supported.has(f));
      if (unsupported.length) {
        skipped += 1;
        if (!blockedSources.has(test.file)) {
          blockedSources.add(test.file);
          for (const f of unsupported) {
            blockedByFeature.set(f, (blockedByFeature.get(f) || 0) + 1);
          }
        }
        return;
      }
    }

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
        features: features,
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
    if (supported && skipped) {
      process.stderr.write(
        `skipped ${skipped} scenario(s) across ${blockedSources.size} test(s) needing unsupported features\n`,
      );
      const top = [...blockedByFeature.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 20);
      process.stderr.write('  unsupported features blocking the most tests:\n');
      for (const [feature, n] of top) {
        process.stderr.write(`    ${String(n).padStart(6)}  ${feature}\n`);
      }
      const remaining = blockedByFeature.size - top.length;
      if (remaining > 0) {
        process.stderr.write(`    ... and ${remaining} more feature(s)\n`);
      }
    }
  });
}

main();

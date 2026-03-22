import fs from 'node:fs';
import path from 'node:path';

const STATS_SUFFIX = '.dynajs-stats-json';

function usage() {
  console.error('Usage: node scripts/merge-stats.mjs <path>');
  process.exit(1);
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
      continue;
    }
    callback(fullPath);
  }
}

function readStatFile(filename) {
  const parsed = JSON.parse(fs.readFileSync(filename, 'utf8'));
  if (!isObject(parsed) || !isObject(parsed.es6Features)) {
    throw new Error(`Invalid stat file: ${filename}`);
  }
  return parsed;
}

function mergeFeatureCounts(target, source) {
  for (const [feature, value] of Object.entries(source)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`Invalid feature count for "${feature}"`);
    }
    target[feature] = (target[feature] ?? 0) + value;
  }
}

const root = process.argv[2];
if (root === undefined || process.argv.length > 3) {
  usage();
}

const rootPath = path.resolve(root);
if (!fs.existsSync(rootPath)) {
  throw new Error(`Path not found: ${rootPath}`);
}

const merged = { es6Features: {} };

if (fs.statSync(rootPath).isDirectory()) {
  walk(rootPath, filename => {
    if (!filename.endsWith(STATS_SUFFIX)) {
      return;
    }
    mergeFeatureCounts(merged.es6Features, readStatFile(filename).es6Features);
  });
} else if (rootPath.endsWith(STATS_SUFFIX)) {
  mergeFeatureCounts(merged.es6Features, readStatFile(rootPath).es6Features);
} else {
  throw new Error(`Expected a directory or *${STATS_SUFFIX} file: ${rootPath}`);
}

const sortedFeatures = Object.fromEntries(
  Object.entries(merged.es6Features).sort(([left], [right]) => left.localeCompare(right)),
);

process.stdout.write(`${JSON.stringify({ es6Features: sortedFeatures }, null, 2)}\n`);

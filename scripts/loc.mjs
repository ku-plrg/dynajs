#!/usr/bin/env node
// Measure LOC of JS/TS files. Each file is stripped of comments and run through
// prettier (same formatting for everyone) before non-blank lines are counted.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import chalk from 'chalk';

const EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
]);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);

function scriptKindFor(file) {
  switch (path.extname(file).toLowerCase()) {
    case '.ts':
    case '.mts':
    case '.cts':
      return ts.ScriptKind.TS;
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    default:
      return ts.ScriptKind.JS;
  }
}

// Reprint the AST without comments; prettier normalizes the layout afterwards.
function stripComments(source, file) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindFor(file),
  );
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });
  return printer.printFile(sourceFile);
}

// Resolve the project-local prettier so the script works when run directly
// (node scripts/loc.mjs ...), not only via npm where node_modules/.bin is on PATH.
const PRETTIER_BIN = path.join(import.meta.dirname, '..', 'node_modules', '.bin', 'prettier');

function prettierFormat(code, file) {
  const res = spawnSync(PRETTIER_BIN, ['--stdin-filepath', file], {
    input: code,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error((res.stderr || '').trim() || `prettier exited ${res.status}`);
  }
  return res.stdout;
}

function countLoc(code) {
  return code.split('\n').filter((line) => line.trim() !== '').length;
}

function collectFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    return EXTENSIONS.has(path.extname(target).toLowerCase()) ? [target] : [];
  }
  const out = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...collectFiles(full));
    } else if (
      entry.isFile() &&
      EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const targets = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  if (targets.length === 0) {
    console.error('Usage: node scripts/loc.mjs <file-or-dir> [more...]');
    process.exit(1);
  }

  const files = [...new Set(targets.flatMap(collectFiles))].sort();
  if (files.length === 0) {
    console.error('No JS/TS files found.');
    process.exit(1);
  }

  const rows = [];
  let total = 0;
  for (const file of files) {
    const rel = path.relative(process.cwd(), file) || file;
    try {
      const loc = countLoc(prettierFormat(stripComments(fs.readFileSync(file, 'utf8'), file), file));
      total += loc;
      rows.push({ rel, loc: String(loc) });
    } catch (err) {
      rows.push({ rel, loc: chalk.red('ERROR'), note: err.message });
    }
  }

  const locWidth = Math.max(3, ...rows.map((r) => r.loc.length), String(total).length);
  for (const r of rows) {
    console.log(`${r.loc.padStart(locWidth)}  ${r.rel}`);
    if (r.note) console.log(`${' '.repeat(locWidth)}  ${chalk.dim(r.note)}`);
  }
  if (files.length > 1) {
    console.log('-'.repeat(locWidth + 2 + 5));
    console.log(
      `${chalk.bold(String(total).padStart(locWidth))}  ${chalk.bold(
        `TOTAL (${files.length} files)`,
      )}`,
    );
  }
}

main();

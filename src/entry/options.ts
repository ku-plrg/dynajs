import path from 'node:path';
import parseArgs from 'yargs-parser';
import { POS_MODE_DEFAULT, PosMode } from '../constant.js';
import { raise } from '../utils.js';

export type RuntimeOptions = {
  help: boolean;
  analysis?: string;
  home?: string;
  verbose: boolean;
  partialHook: boolean;
  ignoreNodeModules: boolean;
  pos: PosMode;
  includeRoots: string[];
  excludeRoots: string[];
};

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function collectIncludeRoots(parsed: parseArgs.Arguments): string[] {
  const collected: string[] = [process.cwd()];

  const fromEnv = process.env.DYNAJS_INCLUDE;
  if (fromEnv && fromEnv.length > 0) {
    for (const entry of fromEnv.split(path.delimiter)) {
      if (entry.length > 0) collected.push(entry);
    }
  }

  const fromArgs = parsed.include;
  if (typeof fromArgs === 'string' && fromArgs.length > 0) {
    collected.push(fromArgs);
  } else if (Array.isArray(fromArgs)) {
    for (const entry of fromArgs) {
      if (typeof entry === 'string' && entry.length > 0) collected.push(entry);
    }
  }

  return dedupeResolved(collected);
}

// Directories excluded from instrumentation even when they fall inside an include
// root (which the always-present cwd makes broad). The motivating case is the
// analysis's own runtime dependencies — e.g. concolic's z3javascript solver, a
// native FFI binding that segfaults if its JS is rewritten — so this carves out a
// specific directory rather than blanket-skipping node_modules (still legitimate
// to instrument). Collected from `--exclude` (repeatable) and DYNAJS_EXCLUDE
// (path-delimited); no default.
function collectExcludeRoots(parsed: parseArgs.Arguments): string[] {
  const collected: string[] = [];

  const fromEnv = process.env.DYNAJS_EXCLUDE;
  if (fromEnv && fromEnv.length > 0) {
    for (const entry of fromEnv.split(path.delimiter)) {
      if (entry.length > 0) collected.push(entry);
    }
  }

  const fromArgs = parsed.exclude;
  if (typeof fromArgs === 'string' && fromArgs.length > 0) {
    collected.push(fromArgs);
  } else if (Array.isArray(fromArgs)) {
    for (const entry of fromArgs) {
      if (typeof entry === 'string' && entry.length > 0) collected.push(entry);
    }
  }

  return dedupeResolved(collected);
}

function dedupeResolved(entries: string[]): string[] {
  const seen = new Set<string>();
  const resolved: string[] = [];
  for (const entry of entries) {
    const abs = path.resolve(entry);
    if (!seen.has(abs)) {
      seen.add(abs);
      resolved.push(abs);
    }
  }
  return resolved;
}

function parseLocMode(value: unknown): PosMode {
  switch (value) {
    case undefined:
      return POS_MODE_DEFAULT;
    case PosMode.PERSIST:
    case PosMode.MEMORY:
    case PosMode.OFF:
      return value;
    default:
      raise(
        `Invalid --pos value: ${String(value)}. Expected one of: ${PosMode.PERSIST}, ${PosMode.MEMORY}, ${PosMode.OFF}.`,
      );
  }
}

export function printHelp(): void {
  console.log(`
Usage: DYNAJS_OPTIONS="<options>" dynajs <command> [args...]

\`dynajs\` runs the given command with injected \`NODE_OPTIONS\`,
so it can be used with \`node\`, \`npm\`, \`npx\`, and other Node-based commands.

Options:
  --help, -h            Show this help message
  --analysis, -a <path> Path to the analysis callback module
  --home <path>         Base path for resolving analysis and target scripts
  --verbose             Enable verbose logging
  --partial             Enable partial instrumentation (only instrument features with hooks)
  --full                Enable full instrumentation (instrument all features)
  --ignore-node-modules Ignore files in node_modules directory
  --pos <mode>          Position tracking mode: ${PosMode.PERSIST} | ${PosMode.MEMORY} | ${PosMode.OFF} (default: ${POS_MODE_DEFAULT})
  --include <path>      Additional directory to instrument (repeatable; cwd is always included).
                        Also configurable via DYNAJS_INCLUDE env var (path-delimited list).
  --exclude <path>      Directory to skip even when inside an include root (repeatable).
                        Also configurable via DYNAJS_EXCLUDE env var (path-delimited list).
`);
}

export function getRuntimeOptions(): RuntimeOptions {
  const parsed = parseArgs(process.env.DYNAJS_OPTIONS ?? '', {
    alias: {
      analysis: ['a'],
      pos: ['position'],
    },
    boolean: ['help', 'verbose', 'partial', 'full', 'ignore-node-modules'],
    string: ['analysis', 'home', 'pos'],
    array: ['include', 'exclude'],
    configuration: {
      'short-option-groups': false,
    },
  });

  const full = typeof parsed.full === 'boolean' ? parsed.full : undefined;
  const partial = typeof parsed.partial === 'boolean' ? parsed.partial : false;

  if (full && partial) {
    throw new Error('DYNAJS_OPTIONS cannot contain both --full and --partial.');
  }

  return {
    help: typeof parsed.help === 'boolean' ? parsed.help : false,
    analysis: getStringValue(parsed.analysis),
    home: getStringValue(parsed.home) ?? process.env.DYNAJS_HOME,
    verbose: typeof parsed.verbose === 'boolean' ? parsed.verbose : false,
    partialHook: full ? false : (partial ?? false),
    ignoreNodeModules:
      typeof parsed['ignore-node-modules'] === 'boolean'
        ? parsed['ignore-node-modules']
        : false,
    pos: parseLocMode(getStringValue(parsed.pos)),
    includeRoots: collectIncludeRoots(parsed),
    excludeRoots: collectExcludeRoots(parsed),
  };
}

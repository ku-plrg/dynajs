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
  stat: boolean;
  pos: PosMode;
};

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
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
  --stat                Generate statistics files for each instrumented file
  --pos <mode>          Position tracking mode: ${PosMode.PERSIST} | ${PosMode.MEMORY} | ${PosMode.OFF} (default: ${POS_MODE_DEFAULT})
`);
}

export function getRuntimeOptions(): RuntimeOptions {
  const parsed = parseArgs(process.env.DYNAJS_OPTIONS ?? '', {
    alias: {
      analysis: ['a'],
      pos: ['position'],
    },
    boolean: [
      'help',
      'verbose',
      'partial',
      'full',
      'ignore-node-modules',
      'stat',
    ],
    string: [
      'analysis',
      'home',
      'pos',
    ],
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
    partialHook: full ? false : partial ?? false,
    ignoreNodeModules: typeof parsed['ignore-node-modules'] === 'boolean' ? parsed['ignore-node-modules'] : false,
    stat: typeof parsed.stat === 'boolean' ? parsed.stat : false,
    pos: parseLocMode(getStringValue(parsed.pos)),
  };
}

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { instrumentFile } from '../instrument/main.js';
import { PosMode } from '../constant.js';

const COMMAND_NAME = path.basename(fileURLToPath(import.meta.url), '.js');

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
// dist/bin/<command>.js → repo root is two levels up
const DYNAJS_HOME =
  process.env.DYNAJS_HOME ?? path.resolve(SCRIPT_DIR, '..', '..');

const BUILT_PRESETS: Record<string, string> = {
  taint: 'analyses/dist/Taint.mjs',
  concolic: 'analyses/dist/Concolic.mjs',
  noop: 'analyses/dist/Noop.mjs',
  'noop-nobuiltin': 'analyses/dist/NoopNoBuiltin.mjs',
};

function sampleMap(): Record<string, string> {
  const dir = path.join(DYNAJS_HOME, 'samples');
  if (!existsSync(dir)) return {};
  const out: Record<string, string> = {};
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const base = f.slice(0, -3);
    out[base.toLowerCase()] = base;
  }
  return out;
}

function listSamples(): string[] {
  return Object.keys(sampleMap()).sort();
}

function listPresets(): string[] {
  return [...Object.keys(BUILT_PRESETS), ...listSamples()];
}

function resolvePreset(name: string): string {
  const key = name.toLowerCase();
  if (key in BUILT_PRESETS) {
    const p = path.join(DYNAJS_HOME, BUILT_PRESETS[key]);
    if (!existsSync(p)) {
      throw new Error(
        `Built preset '${key}' missing at ${p}. Run \`npm run build\` first.`,
      );
    }
    return p;
  }
  const actual = sampleMap()[key];
  if (actual) return path.join(DYNAJS_HOME, 'samples', `${actual}.js`);
  throw new Error(
    `Unknown preset '${name}'. Run \`${COMMAND_NAME} list\` to see available presets.`,
  );
}

function resolveAnalysisFile(p: string): string {
  const resolved = path.resolve(p);
  if (!existsSync(resolved)) {
    throw new Error(`Analysis file not found: ${resolved}`);
  }
  return resolved;
}

type RunArgs = {
  preset?: string;
  analysis?: string;
  'no-analysis'?: boolean;
  verbose?: boolean;
  partial?: boolean;
  full?: boolean;
  'ignore-node-modules'?: boolean;
  pos?: string;
  home?: string;
  include?: string[];
  cmd?: string[];
  '--'?: string[];
};

function cmdRun(argv: RunArgs): number {
  let analysisPath: string | undefined;
  if (argv['no-analysis']) {
    analysisPath = undefined;
  } else if (argv.preset) {
    analysisPath = resolvePreset(argv.preset);
  } else if (argv.analysis) {
    analysisPath = resolveAnalysisFile(argv.analysis);
  } else {
    process.stderr.write(
      'Error: one of --preset/-p, --analysis/-a, or --no-analysis is required.\n',
    );
    return 2;
  }

  const opts: string[] = [];
  if (argv.verbose) opts.push('--verbose');
  if (argv.partial) opts.push('--partial');
  if (argv.full) opts.push('--full');
  if (argv['ignore-node-modules']) opts.push('--ignore-node-modules');
  if (argv.pos) opts.push('--pos', argv.pos);
  if (argv.home) opts.push('--home', argv.home);
  for (const inc of argv.include ?? []) opts.push('--include', inc);
  if (analysisPath) opts.push('--analysis', analysisPath);

  const cmd = argv['--'] ?? [];
  if (cmd.length === 0) {
    if ((argv.cmd ?? []).length > 0) {
      process.stderr.write(
        `Error: separate the target command with '--', e.g. \`${COMMAND_NAME} run [opts...] -- <cmd...>\`\n`,
      );
    } else {
      process.stderr.write('Error: missing target command\n');
    }
    return 2;
  }

  const dynajsBin = path.join(DYNAJS_HOME, 'dynajs');
  if (!existsSync(dynajsBin)) {
    throw new Error(`dynajs script not found at ${dynajsBin}`);
  }
  const result = spawnSync(dynajsBin, cmd, {
    stdio: 'inherit',
    env: { ...process.env, DYNAJS_HOME, DYNAJS_OPTIONS: opts.join(' ') },
  });
  return result.status ?? 1;
}

function cmdInstrument(file: string, verbose: boolean): number {
  instrumentFile(file, {
    verbose,
    isScript: true,
    callbackHint: undefined,
    pos: PosMode.PERSIST,
  });
  return 0;
}

function cmdClean(args: string[]): number {
  const cleanBin = path.join(DYNAJS_HOME, 'djx-clean');
  if (!existsSync(cleanBin)) {
    throw new Error(`djx-clean script not found at ${cleanBin}`);
  }
  const result = spawnSync(cleanBin, args, { stdio: 'inherit' });
  return result.status ?? 1;
}

function cmdList(): number {
  process.stdout.write('Built presets:\n');
  for (const name of Object.keys(BUILT_PRESETS)) {
    const p = path.join(DYNAJS_HOME, BUILT_PRESETS[name]);
    const ok = existsSync(p);
    process.stdout.write(
      `  ${name}${ok ? '' : '  (not built — run `npm run build`)'}\n`,
    );
  }
  process.stdout.write('\nSamples:\n');
  for (const s of listSamples()) {
    process.stdout.write(`  ${s}\n`);
  }
  return 0;
}

const PRESETS = listPresets();

// zsh completion: pre-`--` delegates to yargs's --get-yargs-completions; post-`--`
// delegates to _normal so the wrapped target command's own completion kicks in
// (the same trick oh-my-zsh's `_sudo` uses).
const ZSH_COMPLETION = `#compdef ${COMMAND_NAME}
_${COMMAND_NAME}() {
  local i
  for (( i=1; i <= \${#words}; i++ )); do
    if [[ "\${words[i]}" == "--" ]]; then
      if (( i < CURRENT )); then
        shift $i words
        (( CURRENT -= i ))
        _normal -p ${COMMAND_NAME}
        return
      fi
      break
    fi
  done
  local prev=\${words[CURRENT-1]}
  case $prev in
    -a|--analysis) _files; return ;;
    --home|--include) _files -/; return ;;
  esac
  local reply
  local si=$IFS
  IFS=$'\\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" ${COMMAND_NAME} --get-yargs-completions "\${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _${COMMAND_NAME} ${COMMAND_NAME}
`;

// bash completion: same idea using _command_offset (from bash-completion).
// Without bash-completion installed, falls back to file completion past --.
const BASH_COMPLETION = `_${COMMAND_NAME}() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local prev="\${COMP_WORDS[COMP_CWORD-1]}"
  local i
  for (( i=1; i < COMP_CWORD; i++ )); do
    if [[ "\${COMP_WORDS[i]}" == "--" ]]; then
      if declare -F _command_offset >/dev/null 2>&1; then
        _command_offset $((i + 1))
      else
        COMPREPLY=( $(compgen -cf -- "$cur") )
      fi
      return
    fi
  done
  case "$prev" in
    -a|--analysis)
      COMPREPLY=( $(compgen -f -- "$cur") )
      return ;;
    --home|--include)
      COMPREPLY=( $(compgen -d -- "$cur") )
      return ;;
  esac
  local IFS=$'\\n'
  local reply
  reply=$(COMP_CWORD="$COMP_CWORD" COMP_LINE="$COMP_LINE" COMP_POINT="$COMP_POINT" ${COMMAND_NAME} --get-yargs-completions "\${COMP_WORDS[@]}" 2>/dev/null)
  COMPREPLY=()
  local line
  for line in $reply; do
    [[ -n "$line" ]] && COMPREPLY+=("\${line%%:*}")
  done
}
complete -F _${COMMAND_NAME} ${COMMAND_NAME}
`;

function detectShell(): 'zsh' | 'bash' | undefined {
  const shell = process.env.SHELL ?? '';
  if (shell.endsWith('zsh')) return 'zsh';
  if (shell.endsWith('bash')) return 'bash';
  return undefined;
}

function cmdCompletion(shell: string | undefined): number {
  const target = shell ?? detectShell();
  if (target === 'zsh') {
    process.stdout.write(ZSH_COMPLETION);
    return 0;
  }
  if (target === 'bash') {
    process.stdout.write(BASH_COMPLETION);
    return 0;
  }
  process.stderr.write(
    `Unsupported or undetected shell${shell ? `: ${shell}` : ''}. Use \`${COMMAND_NAME} completion zsh\` or \`${COMMAND_NAME} completion bash\`.\n`,
  );
  return 2;
}

const EPILOG = `Environment:
  DYNAJS_HOME  Repository root (auto-detected from this script if unset)

Shell completion:
  Add to your shell init (bash/zsh):
    # for POSIX-compliant shells:
    eval "$(${COMMAND_NAME} completion)"
    # if 'source' is supported:
    source <(${COMMAND_NAME} completion)`;

let exitCode = 0;

try {
  await yargs(hideBin(process.argv))
    .scriptName(COMMAND_NAME)
    .usage(
      `${COMMAND_NAME} — wrapper around dynajs\n\nUsage: $0 <command> [args]`,
    )
    .command(
      'run [cmd..]',
      'Run analysis on a target command',
      (y) =>
        y
          .strictCommands(false)
          .parserConfiguration({
            'populate--': true,
            // Without this, `--no-analysis` would be re-interpreted as
            // setting `--analysis=false` rather than as its own boolean flag.
            'boolean-negation': false,
          })
          .positional('cmd', {
            type: 'string',
            array: true,
            describe: 'Unused — pass the target command after `--`',
            hidden: true,
          })
          .option('preset', {
            alias: 'p',
            type: 'string',
            choices: PRESETS,
            describe: 'Built-in preset or sample analysis name',
          })
          .option('analysis', {
            alias: 'a',
            type: 'string',
            describe: 'Path to a custom analysis file',
          })
          .option('no-analysis', {
            type: 'boolean',
            describe: 'Run dynajs without injecting an --analysis',
          })
          .option('verbose', {
            type: 'boolean',
            describe: 'Forward --verbose to dynajs',
          })
          .option('partial', {
            type: 'boolean',
            describe: 'Forward --partial to dynajs',
          })
          .option('full', {
            type: 'boolean',
            describe: 'Forward --full to dynajs',
          })
          .option('ignore-node-modules', {
            type: 'boolean',
            describe: 'Forward --ignore-node-modules to dynajs',
          })
          .option('pos', {
            type: 'string',
            choices: [PosMode.PERSIST, PosMode.MEMORY, PosMode.OFF],
            describe: 'Forward --pos to dynajs',
          })
          .option('home', {
            type: 'string',
            describe: 'Forward --home to dynajs',
          })
          .option('include', {
            type: 'string',
            array: true,
            describe: 'Forward --include to dynajs (repeatable)',
          })
          .example(
            '$0 run -p traceall -- node target.js',
            'Run a sample preset',
          )
          .example(
            '$0 run -p taint --partial -- node target.js',
            'Forward dynajs flags',
          )
          .example(
            '$0 run -a ./my-analysis.js -- node target.js',
            'Use a custom analysis file',
          )
          .example(
            '$0 run --no-analysis -- node target.js',
            'Run dynajs without injecting an --analysis',
          ),
      (argv) => {
        exitCode = cmdRun(argv as unknown as RunArgs);
      },
    )
    .command(
      'instrument <file>',
      'Instrument a JavaScript file',
      (y) =>
        y
          .positional('file', { type: 'string', demandOption: true })
          .option('verbose', {
            type: 'boolean',
            alias: 'v',
            default: false,
            describe: 'Enable verbose logging',
          }),
      (argv) => {
        exitCode = cmdInstrument(argv.file as string, argv.verbose);
      },
    )
    .command(
      'clean [dir]',
      'Clean instrumented files',
      (y) =>
        y.positional('dir', {
          type: 'string',
          describe: 'Directory to clean (default: cwd)',
        }),
      (argv) => {
        exitCode = cmdClean(argv.dir ? [argv.dir as string] : []);
      },
    )
    .command(
      'list',
      'List available analyses',
      () => {},
      () => {
        exitCode = cmdList();
      },
    )
    .command(
      'completion [shell]',
      'Output a shell completion script (eval to enable tab completion)',
      (y) =>
        y.positional('shell', {
          type: 'string',
          choices: ['zsh', 'bash'],
          describe: 'Target shell (auto-detected from $SHELL if omitted)',
        }),
      (argv) => {
        exitCode = cmdCompletion(argv.shell as string | undefined);
      },
    )
    .demandCommand(1, `Specify a subcommand. Try \`${COMMAND_NAME} --help\`.`)
    .strictCommands()
    .recommendCommands()
    .help()
    .alias('help', 'h')
    .version(false)
    .epilog(EPILOG)
    .parseAsync();
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(1);
}

process.exit(exitCode);

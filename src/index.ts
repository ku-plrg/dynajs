import yargs from 'yargs/yargs';
import Module from 'module';
import path from 'path';
import { createRequire } from 'node:module';
import { getArgs, readFile } from './utils.js';
import { instrumentFile } from './instrument/main.js';
import { SCRIPT_NAME } from './constants/general.js';
import { setBaseObj } from './analysis.js';
import { checkAnalysisHooks } from './boot.js';

// need `require` to load the analysis callback
const require = createRequire(import.meta.url);

// `instrument` command
const instrumentCommand = (argv: any): void => {
  const [ targetPath ] = getArgs('instrument', argv, 1);
  const { verbose } = argv;
  instrumentFile(targetPath, { verbose, isScript: true, callbackHint: undefined });
}

// `analyze` command
function analyzeCommand(argv: any): void {
  const [ targetPath ] = getArgs('analyze', argv, 1);
  analyze(targetPath, argv);
}

function prepareGlobals(): void {
  (globalThis as any).print = (...args: any[]) => console.log(...args);
  (globalThis as any).assert = (condition: any, message?: string) => {
    if (!condition) throw new Error(message || 'Assertion failed');
  };
}

// analyze a JS file
function analyze(targetPath: string, options: any = {}): string {
  const { verbose, analysis, full } = options;

  setBaseObj();
  prepareGlobals();
  require(path.resolve(analysis));

  const hooks = checkAnalysisHooks(full);

  // override the .js extension handler
  const ModuleAny = Module as any;
  ModuleAny._extensions['.js'] = function (module: any, filename: string) {
    let instrumentedCode: string = instrumentFile(filename, { verbose, callbackHint: hooks, isScript: true });
    module._compile(instrumentedCode, filename);
  };

  // setup exit handler to end the analysis
  process.on('exit', () => D$.analysis?.endExecution?.());

  // load and run the target script
  const script = path.resolve(targetPath);
  const code = readFile(script);
  Module.Module.runMain(script);

  return D$.analysis.result;
}

// main function to parse command line arguments
try {
  yargs(process.argv.slice(2))
    .locale('en')
    .scriptName(SCRIPT_NAME)
    .usage('Usage: $0 <command> [options]')
    .command(
      'instrument',
      'Instrument a JS file',
      {},
      instrumentCommand
    )
    .example('$0 instrument input.js', 'Instrument a JS file')
    .command(
      'analyze',
      'Analyze a JS file',
      (yargs) => yargs
        .option('analysis', {
          alias: 'a',
          describe: 'Target analysis module',
          type: 'string',
        })
        .option('full', {
          alias: 'f',
          type: 'boolean',
          description: 'Instrument all hooking points (disables adaptive instrumentation)',
          conflicts: 'partial',
        })
        .option('partial', {
          alias: 'p',
          type: 'boolean',
          description: 'Instrument only hooks used by the analysis module (default)',
          conflicts: 'full',
        })
      ,
      analyzeCommand
    )
    .example('$0 analyze input.js', 'Analyze a JS file')
    .option('verbose', {
      type: 'boolean',
      description: 'Use verbose logging',
    })
    .demandCommand(1, `You need a command to run \`${SCRIPT_NAME}\`.`)
    .parse();
} catch (e) {
  if (typeof e === 'string') {
    console.error(e);
  } else {
    throw e;
  }
}

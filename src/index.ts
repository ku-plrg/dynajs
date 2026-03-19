import yargs from 'yargs/yargs';
import Module from 'module';
import path from 'path';
import {
  getArgs,
  log,
  readFile,
  stringify,
} from './utils.js';
import { instrumentFile } from './instrument.js';
import { SCRIPT_NAME } from './constants/general.js';
import './analysis';
import { CALLBACK_TO_FEATURES, FEATURE_CHECK_ALL_FALSE, type FeatureTag, type FeatureTagCheck } from './types.js';

// `instrument` command
const instrumentCommand = (argv: any): void => {
  const [ targetPath ] = getArgs('instrument', argv, 1);
  const { detail } = argv;
  instrumentFile(targetPath, { detail });
}

// `analyze` command
function analyzeCommand(argv: any): void {
  const [ targetPath ] = getArgs('analyze', argv, 1);
  analyze(targetPath, argv);
}

function checkAnalysisHooks(fullOpt: boolean): FeatureTagCheck | undefined {
  if (fullOpt) return undefined;

  const analysis = D$.analysis;
  if (!analysis) return undefined;

  const tags: FeatureTagCheck = { ...FEATURE_CHECK_ALL_FALSE };
  for (const [callbackName, hookTags] of Object.entries(CALLBACK_TO_FEATURES)) {
    if (callbackName in analysis) {
      for (const tag of hookTags) tags[tag as FeatureTag] = true;
    }
  }
  return tags;
}

// analyze a JS file
function analyze(targetPath: string, options: any = {}): string {
  const { detail, analysis, full } = options;
  const nativeObjectCreate = Object.create as typeof Object.create | undefined;
  const nativeSet = Set;

  require(path.resolve(analysis));

  const hooks = checkAnalysisHooks(full);

  // override the .js extension handler
  const ModuleAny = Module as any;
  ModuleAny._extensions['.js'] = function (module: any, filename: string) {
    const currentObjectCreate = Object.create as typeof Object.create | undefined;
    const currentSet = Set;
    if (currentObjectCreate !== nativeObjectCreate) {
      (Object as any).create = nativeObjectCreate;
    }
    if (currentSet !== nativeSet) {
      (globalThis as any).Set = nativeSet;
    }
    let instrumentedCode: string;
    try {
      instrumentedCode = instrumentFile(filename, { detail, isEnabled: hooks });
    } finally {
      if (Object.create !== currentObjectCreate) {
        (Object as any).create = currentObjectCreate;
      }
      if (Set !== currentSet) {
        (globalThis as any).Set = currentSet;
      }
    }
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
    .option('detail', {
      type: 'boolean',
      description: 'Show detailed process',
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

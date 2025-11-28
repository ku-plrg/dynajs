import yargs from 'yargs/yargs';
import Module from 'module';
import path from 'path';
import {
  getArgs,
  log,
  readFile,
  stringify,
} from './utils';
import { instrumentFile } from './instrument';
import { SCRIPT_NAME } from './constants';
import './analysis';

// `instrument` command
export const instrumentCommand = (argv: any): void => {
  const [ targetPath ] = getArgs('instrument', argv, 1);
  const { detail } = argv;
  instrumentFile(targetPath, { detail });
}

// `analyze` command
export function analyzeCommand(argv: any): void {
  const [ targetPath ] = getArgs('analyze', argv, 1);
  analyze(targetPath, argv);
}

// analyze a JS file
export function analyze(targetPath: string, options: any = {}): string {
  const { detail, analysis } = options;

  require(path.resolve(analysis));

  // override the .js extension handler
  const ModuleAny = Module as any;
  ModuleAny._extensions['.js'] = function (module: any, filename: string) {
    const instrumentedCode = instrumentFile(filename, { detail });
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
      'Analyze a JS fil',
      (yargs) => yargs
        .option('analysis', {
          alias: 'a',
          describe: 'Target analysis module',
          type: 'string',
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

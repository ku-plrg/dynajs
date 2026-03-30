import yargs from 'yargs/yargs';
import { err, getArgs } from './utils.js';
import { instrumentFile } from './instrument/main.js';
import { PosMode, SCRIPT_NAME } from './constant.js';

// `instrument` command
const instrumentCommand = (argv: any): void => {
  const [ targetPath ] = getArgs('instrument', argv, 1);
  const { verbose } = argv;
  instrumentFile(targetPath, {
    verbose,
    isScript: true,
    callbackHint: undefined,
    // use PosMode.PERSIST for static instrumentation - cause there is no `on-the-fly` behaviour in this command.
    pos: PosMode.PERSIST,
  });
}

// `analyze` command
function analyzeCommand(): void {
  err('`analyze` command is dropped. Please use new `dynajs` instead. run DYNAJS_OPTIONS="--help" dynajs to see usage.');
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

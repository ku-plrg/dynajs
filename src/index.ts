import yargs from 'yargs/yargs';

import {
  getArgs,
  getNameWithoutExtension,
  log,
  readFile,
  writeFile,
} from './utils';

import { instrument } from './instrument';

export const SCRIPT_NAME = 'dynajs';

// instrument a JS file with hooks
export const instrumentCommand = (argv: any): void => {
  const [ targetPath ] = getArgs('instrument', argv, 1);
  const { detail } = argv;

  // Read the target JS file and parse it
  const code = readFile(targetPath);
  if (detail) log(`The instrumentation target file is \`${targetPath}\`.`);

  const instrumentedCode = instrument(code, { detail });
  if (detail) log('Instrumentation completed.');

  const name = getNameWithoutExtension(targetPath);
  const outputPath = `${name}__${SCRIPT_NAME}__.js`;
  writeFile(outputPath, instrumentedCode);
  if (detail) log(`Instrumented file written to \`${outputPath}\`.`);
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

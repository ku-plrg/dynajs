import chalk from 'chalk';

const VARS = [
  {
    name: 'ESMETA_HOME',
    required: true,
    purpose:
      'path to an esmeta checkout; needed for `npm run copy` (polyfill generation).',
  },
  {
    name: 'NODEMEDIC_HOME',
    required: false,
    purpose: 'path to NodeMedic-FINE; used by `npm run microbench`.',
  },
  {
    name: 'EXPOSE_HOME',
    required: false,
    purpose: 'path to ExpoSE; used by `npm run microbench`.',
  },
  {
    name: 'DYNAJS_HOME',
    required: false,
    purpose: 'override the dynajs install root used by the `djx` launcher.',
  },
];

const isSet = (name) => {
  const v = process.env[name];
  return typeof v === 'string' && v.trim() !== '';
};

const missingRequired = VARS.filter((v) => v.required && !isSet(v.name));
const missingOptional = VARS.filter((v) => !v.required && !isSet(v.name));

if (missingRequired.length === 0 && missingOptional.length === 0) {
  console.log(chalk.green.bold('✓ All known environment variables are set.'));
  process.exit(0);
}

if (missingRequired.length > 0) {
  console.warn(chalk.red.bold('✗ Required environment variables are not set:'));
  for (const v of missingRequired) {
    console.warn(`  ${chalk.red.bold(v.name)} — ${v.purpose}`);
  }
}

if (missingOptional.length > 0) {
  console.warn(
    chalk.yellow.bold('⚠ Optional environment variables are not set:'),
  );
  for (const v of missingOptional) {
    console.warn(`  ${chalk.yellow.bold(v.name)} — ${v.purpose}`);
  }
}

// Warning only: do not break `npm install`.
process.exit(0);

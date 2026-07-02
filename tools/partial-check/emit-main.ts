import { load } from './program.js';
import { emitPartialTs } from './generate/emit.js';

// Prints a regenerated src/instrument/partial.ts to stdout (a proposal — does
// not overwrite the file). Redirect to compare/adopt:
//   npm run check:partial:emit > /tmp/partial.gen.ts && git diff --no-index src/instrument/partial.ts /tmp/partial.gen.ts
const L = load(process.argv[2] || process.cwd());
const { source, edits } = emitPartialTs(L);
process.stderr.write(`// regenerated ${edits} primary getter(s)\n`);
process.stdout.write(source);

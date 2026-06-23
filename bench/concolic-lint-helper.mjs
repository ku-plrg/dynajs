// Preloaded (`node --import`) by the runner's `--lint` mode to count how many
// concolic asserts FIRE on a bench's seeded (concrete) path. dynajs concolic
// executes the concrete seed path, so running the bench with __symbolic__
// returning its seed reproduces exactly that path; the assert ghosts just tally.
// The invariant being linted: exactly one assert fires per path (per file).
//
// An exit hook writes the tally with fs.writeSync(1, ...) — a synchronous fd-1
// write — so the count is flushed before the process exits and the runner's
// spawnSync always captures it, even when the bench body throws.
import { writeSync } from "node:fs";

let fired = 0;
globalThis.__symbolic__ = (_name, seed) => seed; // concolic seed == concrete path
globalThis.__IS_SAT__ = () => { fired++; };
globalThis.__symbolic_assert__ = () => { fired++; };
globalThis.__assert_taint__ = () => {};
globalThis.__set_taint__ = (v) => v;
globalThis.__test_taint__ = (v) => v;

process.on("exit", () => { writeSync(1, `@@FIRED ${fired}\n`); });

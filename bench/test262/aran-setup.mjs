// `node --import` preload (main thread) that makes Aran a per-file runner for
// bench/test262/run.cjs, the Aran analog of linvail/bin/setup.mjs + hook.mjs.
//
// Aran is a pure instrumenter with no execute-a-file entry point, so we mirror
// how Linvail's stock CLI runs: install Aran's intrinsic record on the global
// (the woven code reads it as globalThis["_ARAN_INTRINSIC_"]), then register an
// off-thread module load hook that weaves every ES module with Aran's "blank"
// pipeline (transpile -> retropile, no advice = the analog of `djx -p noop`).
//
// Extracted test262 files load as ES modules here (dynajs is "type": "module"),
// so this matches the ESM semantics of the `node` / `djx` / linvail runners
// rather than re-running them as scripts.
//
//   node bench/test262/run.cjs --runner 'node --import bench/test262/aran-setup.mjs' [...]
//
// ARAN_PATH (default /home/choems/aran) points at an Aran checkout.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export const INTRINSIC = '_ARAN_INTRINSIC_';

const ARAN_DIR = process.env.ARAN_PATH || '/home/choems/aran';
const { compileIntrinsicRecord } = await import(
  pathToFileURL(path.join(ARAN_DIR, 'lib/runtime/index.mjs')).href
);
globalThis[INTRINSIC] = compileIntrinsicRecord(globalThis);

register('./aran-hook.mjs', import.meta.url);

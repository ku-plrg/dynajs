// Browser entry for the DynaJS runtime: installs globalThis.D$ (incl. on-the-fly
// instrumentation for eval/Function) without Node loaders.
import { setBaseObj } from '../../src/analysis.js';
import { initializeIdGenerator } from '../../src/instrument/write.js';
setBaseObj({} as any);
// Page scripts are instrumented by the proxy with ids 0,1,2,...; code
// instrumented in the browser (eval, new Function) counts down from -1 so the
// two ranges never collide in D$.ids.
initializeIdGenerator(true);

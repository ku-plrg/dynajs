import { FlowAnalysis } from '../flow/index.js';
import type { Analysis } from '../../src/types/analysis.js';

declare const D$: { analysis: Analysis } & Record<string, any>;

// Same as Noop, but builtins run natively (opaque) instead of through the spec
// model — a baseline that isolates the cost/effect of the builtin model layer.
export class NoopNoBuiltinAnalysis extends FlowAnalysis<undefined> {
  protected modelBuiltins = false;

  domain = {
    isBottom: (_info: undefined) => true,
    getBottom: () => undefined,
  };

  defaultInfo(_op: unknown, _args: any[]): undefined {
    return undefined;
  }
}

const analysis = new NoopNoBuiltinAnalysis();
D$.analysis = analysis;

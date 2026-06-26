import { FlowAnalysis } from '../flow/index.js';
import type { Analysis } from '../../src/types/analysis.js';

declare const D$: { analysis: Analysis } & Record<string, any>;

export class NoopAnalysis extends FlowAnalysis<undefined> {
  domain = {
    isBottom: (_info: undefined) => true,
    getBottom: () => undefined,
  };

  defaultInfo(_op: unknown, _args: any[]): undefined {
    return undefined;
  }
}

const analysis = new NoopAnalysis();
D$.analysis = analysis;

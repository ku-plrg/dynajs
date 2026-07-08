import { ShadowExecution } from '../shadow/index.js';
import type { Analysis } from '../../src/core/index.js';

declare const D$: { analysis: Analysis } & Record<string, any>;

export class NoopAnalysis extends ShadowExecution<undefined> {
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

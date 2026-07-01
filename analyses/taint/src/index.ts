import type { Analysis } from '../../../src/types/analysis.js';
import { FlowAnalysis, type Valued, type Site } from '../../flow/index.js';
import { installPrelude } from './prelude.js';

declare const D$: { analysis: Analysis } & Record<string, any>;

const GHOSTS = installPrelude();

type TaintInfo = { bit: boolean; chars?: boolean[]; origin?: Site };

function infoTainted(info: TaintInfo | undefined): boolean {
  if (info === undefined) return false;
  if (info.bit) return true;
  // maybe we should not check chars to match NodeMedic's behaviour?
  return info.chars?.some((c) => c) ?? false;
}

function inheritedOrigin(parents: Valued<TaintInfo>[]): Site | undefined {
  for (const p of parents) {
    if (infoTainted(p.info) && p.info?.origin !== undefined)
      return p.info.origin;
  }
  return undefined;
}

export class TaintAnalysis extends FlowAnalysis<TaintInfo> {
  protected transparentCalls = GHOSTS;

  domain = {
    getBottom: () => ({ bit: false }),
    isBottom: (info: TaintInfo) =>
      !info.bit && (info.chars === undefined || info.chars.every((c) => !c)),
  };

  protected defaultInfo(
    value: unknown,
    parents: Valued<TaintInfo>[],
  ): TaintInfo {
    if (!parents.some((p) => infoTainted(p.info))) return { bit: false };
    const origin = inheritedOrigin(parents);
    if (typeof value === 'string') {
      return {
        bit: true,
        chars: Array.from({ length: value.length }, () => true),
        origin,
      };
    }
    return { bit: true, origin };
  }

  protected substringInfo(
    src: Valued<TaintInfo, string>,
    start: Valued<TaintInfo, number>,
    end: Valued<TaintInfo, number>,
    resultLength: number,
  ): TaintInfo {
    const indexTainted = false; // drop this info
    const chars: boolean[] = [];
    for (let i = 0; i < resultLength; i++) {
      if (indexTainted) {
        chars.push(true);
      } else if (src.info?.chars !== undefined) {
        chars.push(src.info.chars[start.value + i] === true);
      } else {
        chars.push(src.info?.bit ?? false);
      }
    }
    return {
      bit: chars.some((c) => c),
      chars,
      origin: inheritedOrigin([src, start, end]),
    };
  }

  protected concatenateInfo(
    left: Valued<TaintInfo>,
    leftLength: number,
    right: Valued<TaintInfo>,
    rightLength: number,
  ): TaintInfo {
    const chars: boolean[] = [];
    const push = (n: number, t: TaintInfo | undefined) => {
      for (let i = 0; i < n; i++) {
        chars.push(
          t?.chars !== undefined ? t.chars[i] === true : (t?.bit ?? false),
        );
      }
    };
    push(leftLength, left.info);
    push(rightLength, right.info);
    return {
      bit: chars.some((c) => c),
      chars,
      origin: inheritedOrigin([left, right]),
    };
  }

  protected rangeInfo(
    indices: number[],
    _lo: Valued<TaintInfo, number>,
    _loInclusive: boolean,
    _hi: Valued<TaintInfo, number>,
    _hiInclusive: boolean,
    _ascending: boolean,
    _bid: number,
  ): TaintInfo[] {
    // A range index is a pure loop counter, so return each untainted no matter how the
    // bounds are tainted — deliberately dropping the control/bound taint a default
    // bound-derived `baseInfo` would carry.
    return indices.map(() => ({ bit: false }));
  }

  isTainted(value: unknown): boolean {
    return infoTainted(this.getInfo(value));
  }

  isTaintedAt(value: unknown, indexW: unknown): boolean {
    const raw = this.valued(indexW).value;
    const index = typeof raw === 'number' ? raw : Number(raw);
    const info = this.getInfo(value);
    if (info === undefined) return false;
    if (info.chars !== undefined && index >= 0 && index < info.chars.length) {
      return info.chars[index] === true;
    }
    return info.bit;
  }

  assert(condW: unknown): void {
    if (this.valued(condW).value) return;
    throw new Error('Assertion failed');
  }

  assertTaint(value: unknown, expectedArg: unknown): void {
    const expected = this.valued(expectedArg).value ? 'detected' : 'clean';
    const actual = this.isTainted(value) ? 'detected' : 'clean';
    console.log(`@@DJX_VERDICT ${actual} ${expected}`);
  }

  setTaint(value: unknown, tainted: boolean): void {
    const info = this.getOrCreateInfo(value, () => ({ bit: false }));
    if (info === undefined) return;
    info.bit = tainted;
    // The source site is where this taint is born; clearing taint clears it.
    info.origin = tainted ? this.site() : undefined;
    const concrete = this.valued(value).value;
    if (typeof concrete === 'string') {
      info.chars = Array.from({ length: concrete.length }, () => tainted);
    }
  }

  taintOrigin(value: unknown): Site | undefined {
    const info = this.getInfo(value);
    return infoTainted(info) ? info.origin : undefined;
  }

  endExecution() {
    D$.analysis.result = { tainted: undefined };
  }
}

D$.analysis = new TaintAnalysis();

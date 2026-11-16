import { FlowAnalysis } from '../flow/index.js';
import Model from '../flow/internal/model.js';
import type { Analysis } from '../../src/types/analysis.js';

declare const D$: { analysis: Analysis } & Record<string, any>;

// Model-conformance analysis for the test262 run (bench/test262/supported.cjs).
// Same as Noop, except that every call to a supported builtin runs its spec
// model, including:
//  - calls whose inputs are all bottom primitives (Noop runs those natively);
//  - indirect calls through Function.prototype.call/apply and Reflect.apply,
//    the shape most test262 tests use (`String.prototype.at.call(obj, 0)`).
//    Without unwrapping, the native `call` runs the native target directly.
//
// Environment:
//  MODEL_CHECK_LIST=1     print the supported builtins as a JSON array of
//                         dotted paths (e.g. "String.prototype.at") and exit.
//  MODEL_CHECK_HITS=file  on exit, append one JSON line
//                         {"file": <script>, "hits": [<path>...]} naming the
//                         supported builtins whose model actually ran.

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs') as typeof import('node:fs');

const FnCall = Function.prototype.call;
const FnApply = Function.prototype.apply;
const ReflectApply = Reflect.apply;
const ArrayFrom = Array.from;

// Reverse map: builtin function object -> dotted path. Built at load time,
// before the test can mutate the globals.
const ROOTS: [string, object][] = [
  ['String', String],
  ['String.prototype', String.prototype],
  ['Array', Array],
  ['Array.prototype', Array.prototype],
];
// A builtin reachable under several keys (trimLeft === trimStart) is named by
// the key matching its own `name`; the other keys are recorded as aliases.
const PATH = new Map<Function, string>();
const ALIASES = new Map<Function, string[]>();
if (Model.support(String)) PATH.set(String, 'String');
if (Model.support(Array)) PATH.set(Array, 'Array');
for (const [prefix, obj] of ROOTS) {
  const keys = Reflect.ownKeys(obj);
  const canonicalFirst = [
    ...keys.filter((k) => typeof k === 'string' && (obj as any)[k]?.name === k),
    ...keys.filter((k) => !(typeof k === 'string' && (obj as any)[k]?.name === k)),
  ];
  for (const key of canonicalFirst) {
    const v = Reflect.getOwnPropertyDescriptor(obj, key)?.value;
    if (typeof v !== 'function' || !Model.support(v)) continue;
    const name =
      typeof key === 'symbol' ? `[${String(key.description)}]` : `.${key}`;
    if (!PATH.has(v)) PATH.set(v, prefix + name);
    else if (PATH.get(v) !== prefix + name) {
      const list = ALIASES.get(v) ?? [];
      list.push(prefix + name);
      ALIASES.set(v, list);
    }
  }
}

if (process.env.MODEL_CHECK_LIST) {
  const unnamed = [...Model.BUILTINS.keys()].filter((f) => !PATH.has(f));
  const aliases: Record<string, string[]> = {};
  for (const [f, list] of ALIASES) aliases[PATH.get(f)!] = list;
  process.stdout.write(
    JSON.stringify(
      {
        supported: [...PATH.values()].sort(),
        aliases,
        unnamed: unnamed.map((f) => f.name),
      },
      null,
      2,
    ) + '\n',
  );
  process.exit(0);
}

function listFrom(arrayLike: unknown): unknown[] {
  if (arrayLike === null || arrayLike === undefined) return [];
  return ArrayFrom(arrayLike as ArrayLike<unknown>);
}

export class ModelCheckAnalysis extends FlowAnalysis<undefined> {
  protected modelAllCalls = true;

  domain = {
    isBottom: (_info: undefined) => true,
    getBottom: () => undefined,
  };

  hits = new Set<string>();

  defaultInfo(_op: unknown, _args: any[]): undefined {
    return undefined;
  }

  protected onModeledCall(f: Function): void {
    this.hits.add(PATH.get(f) ?? f.name);
  }

  invokeFunPre(
    id: number,
    f: any,
    base: any,
    args: any,
    isConstructor: boolean,
    isMethod: boolean,
  ) {
    if (!isConstructor && typeof base === 'function' && Model.support(base)) {
      const a = ArrayFrom(args as ArrayLike<unknown>);
      if (f === FnCall)
        return super.invokeFunPre(id, base, a[0], a.slice(1), false, true);
      if (f === FnApply)
        return super.invokeFunPre(id, base, a[0], listFrom(a[1]), false, true);
    }
    if (
      !isConstructor &&
      f === ReflectApply &&
      typeof args[0] === 'function' &&
      Model.support(args[0])
    ) {
      // Reflect.apply requires an object argumentsList; leave that error to
      // the native path.
      const list = args[2];
      if (list !== null && (typeof list === 'object' || typeof list === 'function'))
        return super.invokeFunPre(id, args[0], args[1], listFrom(list), false, true);
    }
    return super.invokeFunPre(id, f, base, args, isConstructor, isMethod);
  }
}

const analysis = new ModelCheckAnalysis();
D$.analysis = analysis;

const hitsFile = process.env.MODEL_CHECK_HITS;
if (hitsFile) {
  process.on('exit', () => {
    try {
      fs.appendFileSync(
        hitsFile,
        JSON.stringify({ file: process.argv[1], hits: [...analysis.hits].sort() }) + '\n',
      );
    } catch {
      // best effort
    }
  });
}

import type { Analysis } from "@/types/analysis.js";
import { installPrelude, taintMap, wrap, isTainted, setTaint, taintState, __set_taint__, unwrap, getEntry, __assert__, isWrapped, Entry, forcedUnwrap } from "./prelude.js";

declare const D$: { analysis: Analysis } & Record<string, any>;

installPrelude();

function wrapWithPropagation(result: unknown, ids: readonly number[]): unknown {
  const w = wrap(result);
  // TODO: restore taint information
  const shouldTaint = ids.map(id => taintMap.get(id)).some(t => t);
  if (shouldTaint) {
    setTaint(w, true);
  }
  return w;
}

const OPAQUE_CALLS = new Set([console.log, __assert__]);

const idStack: number[][] = [];

const analysis: Analysis = {
  literal(_id, value) {
    const w = wrap(value);
    return w === value ? undefined : { result: w };
  },

  binaryPre(_id, _op, left, right) {
    const [l, r] = [left, right].map(forcedUnwrap);
    idStack.push([l.id, r.id]);
    // return wLeft === left && wRight === right ? undefined : { left: wLeft, right: wRight };
    return { op: _op, left: l, right: r, skip: false };
  },

  binary(_id, _op, left, right, result) {
    const ids = idStack.pop() as number[];
    const w = wrapWithPropagation(result, ids);
    return { result: w };
  },

  unaryPre(_id, _op, _prefix, operand) {
    const w = forcedUnwrap(operand);
    // return w === operand ? undefined : { operand: w };
    idStack.push([w.id]);
    return { op: _op, prefix: _prefix, operand: w.value, skip: false };
  },

  unary(_id, _op, _prefix, operand, result) {
    const ids = idStack.pop() as number[];
    const w = wrapWithPropagation(result, ids);
    return { result: w };
  },

  invokeFunPre(_id, _f, _base, args, isConstructor, isMethod) {
    // switch (_f) {
    //   case __set_taint__: {
    //     return { skip: true, f: _f, base: _base, args, preferModel: false };
    //   }
    // }

    // unwrap if it's a opaque call
    if (OPAQUE_CALLS.has(_f)) {
      // console.log('DEBUG', 'invokeFunPre', _f.name, args);
      const entries = Array.from(args).map(a => isWrapped(a) ? a : wrap(a)).map(getEntry) as Entry[];
      // const ids = entries.map(e => e.id);
      const unwrappedArgs = entries.map(e => e.value);
      // TODO save ids?
      return { skip: false, f: _f, base: _base, args: unwrappedArgs, preferModel: false };
    }

    return { skip: false, f: _f, base: _base, args, preferModel: false };
  },

  invokeFun(_id, _f, _base, args, result, isConstructor, isMethod) {
    // switch (_f) {
    //   case __set_taint__: {
    //     const [target] = args;
    //     // target is wrapped
    //     setTaint(target, true);
    //     return { result: target };
    //   }
    //   case __is_tainted__: {
    //     const [target] = args;
    //     // target is wrapped
    //     return { result: isTainted(target) };
    //   }
    // }

    // console.log('DEBUG', 'invokeFun', _f.name, result);

    const w = wrapWithPropagation(result, []);
    return { result: w };
  },

  endExecution() {
    D$.analysis.result = { tainted: taintState.snapshot() };
  },
};

D$.analysis = analysis;

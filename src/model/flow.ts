import type { Analysis } from "@/types/analysis.js";
import type { SpecOps, Wrapped, Unwrapped } from "./type.js";
import { Wrapper } from "./wrap.js";

type Frame = BinFrame | UnFrame | CallFrame;
export type BinFrame = { ty: 'bin'; op: string; left: Wrapped; right: Wrapped };
export type UnFrame  = { ty: 'un'; op: string; operand: Wrapped };

type CallFrame = OpaqueCall | TransparentCall;
export type OpaqueCall = { ty: 'opaque'; entries: unknown[] };
export type TransparentCall = { ty: 'transparent', entries: unknown[] };

export abstract class FlowAnalysis<Info> implements Analysis {
  wrapper: Wrapper<Info> = new Wrapper();

  abstract spec: SpecOps;

  protected propagate(frame: Frame, result: Unwrapped<unknown>): Wrapped<unknown> {
    switch (frame.ty) {
      case 'bin': {
        const lstr /* : fleft is Wrapped<string> */ = typeof this.spec.peek(frame.left) === 'string';
        const rstr /* : fright is Wrapped<string> */ = typeof this.spec.peek(frame.right) === 'string';
        if (frame.op === '+' && lstr && rstr && this.spec.concatenate) {
          return this.spec.concatenate(frame.left as Wrapped<string>, frame.right as Wrapped<string>);
        }
        const parents = [frame.left, frame.right];
        return this.spec.base(result, parents);
      }
      case 'un': {
        const parents = [frame.operand];
        return this.spec.base(result, parents);
      }
      case 'opaque': {
        // built-in function model
        const parents = Array.from(frame.entries) as Wrapped[]; // can we do this without `as`?
        return this.spec.base(result, parents);
      }
      case 'transparent': {
        // CHECK isn't this already handled by the callee?
        const parents = Array.from(frame.entries) as Wrapped[];
        return this.spec.base(result, parents);
      }
    }
  }

  protected abstract isOpaqueFunction(_f: unknown): unknown

  literal(_id: number, value: unknown) {
    const w = this.spec.base(value as Unwrapped<unknown>, []);
    return w === value ? undefined : { result: w };
  }

  binaryPre(_id: number, op: string, left: Wrapped, right: Wrapped) {
    const l = this.spec.peek(left);
    const r = this.spec.peek(right);
    const frame: BinFrame = { ty: 'bin', op, left, right };
    return { op, left: l, right: r, skip: false, frame };
  }

  binary(_id: number, _op: string, _l: Wrapped, _r: Wrapped, result: Unwrapped<unknown>, frame?: unknown) {
    return { result: this.propagate(frame as BinFrame, result) };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: Wrapped) {
    const e = this.spec.peek(operand);
    const frame: UnFrame = { ty: 'un', op, operand: operand };
    return { op, operand: e, skip: false, frame };
  }

  unary(_id: number, _op: string, _prefix: boolean, _operand: unknown, result: Unwrapped<unknown>, frame?: unknown) {
    return { result: this.propagate(frame as UnFrame, result) };
  }

  invokeFunPre(_id: number, _f: any, _base: any, args: any, _isConstructor: boolean, _isMethod: boolean) {
    const argArr = Array.from(args) as Wrapped[]; // can we do this without `as`?
    if (this.isOpaqueFunction(_f)) {
      const unwrappedArgs = argArr.map(this.spec.peek);
      // TODO : use model
      return { skip: false, f: _f, base: _base, args: unwrappedArgs, preferModel: false, frame: { ty: 'opaque', entries: argArr } };
    }
    return { skip: false, f: _f, base: _base, args, preferModel: false, frame: { ty: 'transparent', entries: argArr } };
  }

  invokeFun(_id: number, _f: any, _base: any, _args: any, result: any, _isConstructor: boolean, _isMethod: boolean, frame?: unknown) {
    return { result: this.propagate(frame as CallFrame, result) };
  }
}

import type { Analysis } from "@/types/analysis.js";
import type { SpecOps } from "@/model/type.js";

type Frame = BinFrame | UnFrame | OpaqueCall;
export type BinFrame = { ty: 'bin'; op: string; left: unknown; right: unknown };
export type UnFrame  = { ty: 'un'; op: string; operand: unknown };

type CallFrame = OpaqueCall | TransparentCall;
export type OpaqueCall = { ty: 'opaque'; entries: unknown[] };
export type TransparentCall = { ty: 'transparent', entries: unknown[] };

export abstract class FlowAnalysis implements Analysis {
  abstract spec: SpecOps;

  protected propagate(frame: Frame, result: unknown): unknown {
    switch (frame.ty) {
      case 'bin': {
        const parents = [frame.left, frame.right];
        return this.spec.base(result, parents);
      }
      case 'un': {
        const parents = [frame.operand];
        return this.spec.base(result, parents);
      }
    }
  }

  protected abstract isOpaqueFunction(_f: unknown): unknown

  literal(_id: number, value: unknown) {
    const w = this.spec.base(value, []);
    return w === value ? undefined : { result: w };
  }

  binaryPre(_id: number, op: string, left: unknown, right: unknown) {
    const l = this.spec.peek(left);
    const r = this.spec.peek(right);
    const frame: BinFrame = { ty: 'bin', op, left, right };
    return { op, left: l, right: r, skip: false, frame };
  }

  binary(_id: number, _op: string, _l: unknown, _r: unknown, result: unknown, frame?: unknown) {
    return { result: this.propagate(frame as BinFrame, result) };
  }

  unaryPre(_id: number, op: string, _prefix: boolean, operand: unknown) {
    const e = this.spec.peek(operand);
    const frame: UnFrame = { ty: 'un', op, operand: operand };
    return { op, operand: e, skip: false, frame };
  }

  unary(_id: number, _op: string, _prefix: boolean, _operand: unknown, result: unknown, frame?: unknown) {
    return { result: this.propagate(frame as UnFrame, result) };
  }

  invokeFunPre(_id: number, _f: any, _base: any, args: any, _isConstructor: boolean, _isMethod: boolean) {
    if (this.isOpaqueFunction(_f)) {
      const unwrappedArgs = args.map(this.spec.peek);
      // TODO : use model
      return { skip: false, f: _f, base: _base, args: unwrappedArgs, preferModel: false, frame: { ty: 'opaque', entries: args } };
    }
    return { skip: false, f: _f, base: _base, args, preferModel: false, frame: undefined };
  }

  invokeFun(_id: number, _f: any, _base: any, _args: any, result: any, _isConstructor: boolean, _isMethod: boolean, frame?: unknown) {
    return { result: this.propagate(frame as OpaqueCall, result) };
  }
}

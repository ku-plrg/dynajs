import { LiftedDomain } from "../internal/lift-domain.js";
import type {
  Lifted,
  Unlifted,
  Primitive,
  ValuedGeneral,
  Valued,
} from '../type.js';

export abstract class ShadowTransfer<Info> extends LiftedDomain<Info> {
    ////////// transfer functions /////////
  
    protected abstract defaultInfo(value: unknown, parents: Valued<Info>[]): Info;
  
    protected substringInfo?(
      _src: Valued<Info, string>,
      _start: Valued<Info, number>,
      _end: Valued<Info, number>,
      _resultLength: number,
    ): Info;
    protected concatenateInfo?(
      _left: Valued<Info, string>,
      _leftLength: number,
      _right: Valued<Info, string>,
      _rightLength: number,
    ): Info;
    protected lengthOfStringInfo?(_src: Valued<Info, string>): Info;
    protected containsStrInfo?(
      _s: Valued<Info, string>,
      _sub: Valued<Info, string>,
    ): Info;
    protected containsListInfo?(_list: Valued<Info>, _x: Valued<Info>): Info;
    protected trimInfo?(
      _src: Valued<Info, string>,
      _leading: boolean,
      _trailing: boolean,
    ): Info;
  
    protected binaryInfo?(
      _op: string,
      _left: Valued<Info>,
      _right: Valued<Info>,
    ): Info;
    protected unaryInfo?(_op: string, _operand: Valued<Info>): Info;
    protected truncateInfo?(_src: Valued<Info, number>): Info;
    /* clamp(x, lower, upper) = max(lower, min(x, upper)) */
    protected clampInfo?(
      _x: Valued<Info, number>,
      _lower: Valued<Info, number>,
      _upper: Valued<Info, number>,
    ): Info;
    protected minInfo?(_operands: Valued<Info, number>[]): Info;
    protected maxInfo?(_operands: Valued<Info, number>[]): Info;
  
    protected rangeInfo?(
      _indices: number[],
      _lo: Valued<Info, number>,
      _loInclusive: boolean,
      _hi: Valued<Info, number>,
      _hiInclusive: boolean,
      _ascending: boolean,
      _bid: number,
    ): Info[];
  
    /* property read from object property or array element */
    protected getFieldInfo?(
      _base: Valued<Info>,
      _prop: Valued<Info>,
      _result: Valued<Info>,
    ): Info;
  
    /* property write to object property or array element (`$.set`); side-effecting
     * (mutates the analysis's model of `base`), so it returns nothing. */
    protected setFieldInfo?(
      _base: Valued<Info>,
      _prop: Valued<Info>,
      _value: Valued<Info>,
    ): void;
  
    protected conditionInfo?(
      _id: number,
      _cond: Valued<Info>,
      _taken: boolean,
    ): void {}
  
    // opaqueCallInfo is enough for now
    // protected escapedInfo?(_f: unknown, _escaped: Valued<Info>[]): void {}
  
    /* opaque call the analysis wants to model */
    protected opaqueCallInfo?(
      _f: unknown,
      _entries: unknown[],
      _result: unknown,
    ): Info;
  
    /** internal(flow.ts) */
    protected numOp(v: number, parents: Lifted<unknown>[]): Lifted<number> {
      return this.lift(
        v,
        this.defaultInfo(
          v,
          parents.map((p) => this.valued(p)),
        ),
      );
    }
  
    /** internal(flow.ts) */
    protected binOp(
      op: string,
      l: Lifted<number>,
      r: Lifted<number>,
      v: number,
    ): Lifted<number> {
      return this.lift(
        v,
        this.binaryInfo?.(op, this.valued(l), this.valued(r)) ??
          this.defaultInfo(v, [this.valued(l), this.valued(r)]),
      );
    }
  
    /** internal(flow.ts) */
    protected unOp(op: string, x: Lifted<number>, v: number): Lifted<number> {
      return this.lift(
        v,
        this.unaryInfo?.(op, this.valued(x)) ??
          this.defaultInfo(v, [this.valued(x)]),
      );
    }
  
    /** internal(flow.ts) — operands are Lifted<unknown>: ordering comparisons pass
     * numbers, but `is`/`isNot` compare strings, sentinels, etc. */
    protected cmpOp(
      op: string,
      l: Lifted<unknown>,
      r: Lifted<unknown>,
      v: boolean,
    ): Lifted<boolean> {
      return this.lift(
        v,
        this.binaryInfo?.(op, this.valued(l), this.valued(r)) ??
          this.defaultInfo(v, [this.valued(l), this.valued(r)]),
      );
    }
  
}
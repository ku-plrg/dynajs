import { LiftedDomain } from '../lift/domain.js';
import type {
  Lifted,
  Unlifted,
  Primitive,
  ValuedGeneral,
  Valued,
} from '../type.js';

/* transfer functions for shadow values */
export abstract class ShadowTransfer<Shadow> extends LiftedDomain<Shadow> {

  protected abstract defaultInfo(value: unknown, parents: Valued<Shadow>[]): Shadow;

  protected substringInfo?(
    _src: Valued<Shadow, string>,
    _start: Valued<Shadow, number>,
    _end: Valued<Shadow, number>,
    _resultLength: number,
  ): Shadow;
  protected concatenateInfo?(
    _left: Valued<Shadow, string>,
    _leftLength: number,
    _right: Valued<Shadow, string>,
    _rightLength: number,
  ): Shadow;
  protected lengthOfStringInfo?(_src: Valued<Shadow, string>): Shadow;
  protected containsStrInfo?(
    _s: Valued<Shadow, string>,
    _sub: Valued<Shadow, string>,
  ): Shadow;
  protected containsListInfo?(_list: Valued<Shadow>, _x: Valued<Shadow>): Shadow;
  protected trimInfo?(
    _src: Valued<Shadow, string>,
    _leading: boolean,
    _trailing: boolean,
  ): Shadow;

  protected binaryInfo?(
    _op: string,
    _left: Valued<Shadow>,
    _right: Valued<Shadow>,
  ): Shadow;
  protected unaryInfo?(_op: string, _operand: Valued<Shadow>): Shadow;
  protected truncateInfo?(_src: Valued<Shadow, number>): Shadow;
  /* clamp(x, lower, upper) = max(lower, min(x, upper)) */
  protected clampInfo?(
    _x: Valued<Shadow, number>,
    _lower: Valued<Shadow, number>,
    _upper: Valued<Shadow, number>,
  ): Shadow;
  protected minInfo?(_operands: Valued<Shadow, number>[]): Shadow;
  protected maxInfo?(_operands: Valued<Shadow, number>[]): Shadow;

  protected rangeInfo?(
    _indices: number[],
    _lo: Valued<Shadow, number>,
    _loInclusive: boolean,
    _hi: Valued<Shadow, number>,
    _hiInclusive: boolean,
    _ascending: boolean,
    _bid: number,
  ): Shadow[];

  /* property read from object property or array element */
  protected getFieldInfo?(
    _base: Valued<Shadow>,
    _prop: Valued<Shadow>,
    _result: Valued<Shadow>,
  ): Shadow;

  /* property write to object property or array element (`$.set`); side-effecting
   * (mutates the analysis's model of `base`), so it returns nothing. */
  protected setFieldInfo?(
    _base: Valued<Shadow>,
    _prop: Valued<Shadow>,
    _value: Valued<Shadow>,
  ): void;

  protected conditionInfo?(
    _id: number,
    _cond: Valued<Shadow>,
    _taken: boolean,
  ): void {}

  // opaqueCallInfo is enough for now
  // protected escapedInfo?(_f: unknown, _escaped: Valued<Info>[]): void {}

  /* opaque call the analysis wants to model */
  protected opaqueCallInfo?(
    _f: unknown,
    _entries: unknown[],
    _result: unknown,
  ): Shadow;

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

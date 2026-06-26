import util from 'node:util';
import type { Lifted, Unlifted, ValuedGeneral, Valued } from '../type.js';
import { BoundaryEscape } from './escape.js';

type IdValuePair = ValuedGeneral<{ id: symbol }, unknown>;

export type InfoDomain<Info> = {
  getBottom: () => Info;
  isBottom: (info: Info) => boolean;
};

export abstract class LiftedDomain<Info> {
  private liftedPrimitives = new WeakSet<object>();
  private valueMap = new WeakMap<object, IdValuePair>();
  private infoMap = new WeakMap<symbol, Info>();

  abstract domain: InfoDomain<Info>;

  protected escaper = new BoundaryEscape(
    this.isPrimitiveProxy.bind(this),
    this.unlift.bind(this),
  );

  // ---- Info storage helpers ----

  protected /* final */ getInfo(value: unknown): Info {
    const e = this.getEntry(value);
    return e === undefined
      ? this.domain.getBottom()
      : (this.infoMap.get(e.id) ?? this.domain.getBottom());
  }

  protected setInfo(value: unknown, info: Info): void {
    const e = this.getEntry(value);
    if (e === undefined) return;
    this.infoMap.set(e.id, info);
  }

  protected getOrCreateInfo(value: unknown, makeEmpty: () => Info): Info {
    const e = this.getEntry(value);
    if (e === undefined) return this.domain.getBottom();
    let info = this.infoMap.get(e.id);
    if (info === undefined) {
      info = makeEmpty();
      this.infoMap.set(e.id, info);
    }
    return info;
  }

  protected valued<V>(v: V): Valued<Info, V> {
    return {
      info: this.getInfo(v) satisfies Info,
      value: this.unlift(v as Lifted<V>),
    } satisfies Valued<Info, V>;
  }

  /** NOTE never override this method */
  protected /* final */ lift<T>(
    value: T,
    info: Info = this.domain.getBottom(),
  ): Lifted<T> {
    let w: Lifted<T>;
    if (this.isObjectish(value)) {
      if (!this.valueMap.has(value as object)) {
        this.valueMap.set(value as object, { id: this.freshId(), value });
      }
      w = value as Lifted<T>;
    } else {
      const proxy = {
        [util.inspect.custom]() {
          return '<lifted-primitive>';
        },
      };
      this.liftedPrimitives.add(proxy);
      this.valueMap.set(proxy, { id: this.freshId(), value });
      w = proxy as T as Lifted<T>;
    }

    /* Bottom carries no information, so skip */
    if (!this.domain.isBottom(info)) this.setInfo(w, info);
    return w;
  }

  ////////// lift-hanlders //////////
  private id = 0;
  protected freshId() {
    return Symbol(this.id++);
  }

  private isObjectish(v: unknown): v is object | Function {
    return v !== null && (typeof v === 'object' || typeof v === 'function');
  }

  protected isPrimitive(
    v: unknown,
  ): v is string | number | boolean | bigint | symbol | null | undefined {
    return !this.isObjectish(v);
  }

  protected isLifted(v: unknown): v is Lifted<unknown> {
    return this.isObjectish(v) && this.valueMap.has(v);
  }

  protected isPrimitiveProxy(v: unknown): v is Lifted<unknown> {
    return this.isObjectish(v) && this.liftedPrimitives.has(v);
  }

  protected unlift<T = unknown>(value: Lifted<T>): Unlifted<T> {
    if (!this.isObjectish(value)) return value as T as Unlifted<T>; // should not happen;
    const entry = this.valueMap.get(value);
    return entry === undefined
      ? (value as T as Unlifted<T>)
      : (entry.value as T as Unlifted<T>);
  }

  protected getEntry(value: unknown): IdValuePair | undefined {
    if (!this.isObjectish(value)) return undefined;
    return this.valueMap.get(value);
  }
}
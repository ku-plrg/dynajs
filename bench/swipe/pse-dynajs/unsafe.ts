namespace TSJ$ {

    // The "any" type is a dangerous way of breaking all our nice static-typing
    // guarantees, as things will automagically be cast both to *and* from it.
    // As a result, it should be avoided whenever possible. "anything" captures
    // the same idea, but doesn't have automagic casts. Ocasionally, usually in
    // the context of casting generics, "any" is unavoidable, but it's been aliased
    // to "unsafe" to emphasize that caution is in order.

    export type unsafe = any;
    export type anything = undefined | null | boolean | number | string | symbol | object;

    export namespace Unsafe {
        export function callMethod(base:anything,offset:anything,...args:anything[]):anything {
            return Clean.apply(getField(base,offset),base,args);
        }
        export function getField(base:anything,offset:anything):anything {
            return (base as unsafe)[offset as unsafe];
        }
        export function setField<T>(base:anything,offset:anything,value:T):T {
            return (base as unsafe)[offset as unsafe] = value;
        }
        export function cast<T>(x:unsafe):T {
            return x as T;
        }
    }
}
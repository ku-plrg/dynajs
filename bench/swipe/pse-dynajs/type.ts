/// <reference path="./integer.ts" />

namespace TSJ$ {
    export type Constructor<T> = new(...args:unsafe[]) => T;

    export class Type<T> {
        // if we don't use T anywhere, the type checker seemingly
        // optimizes it out and then doesn't enforce relevant constraints
        private unused:T|undefined = undefined;

        private constructor(
            public readonly name:string,
            public readonly ctor?:Constructor<T>,
        ) {}

        static readonly undefined = new Type<undefined>("undefined");
        static readonly null = new Type<null>("null");
        static readonly string = new Type<string>("string");
        static readonly number = new Type<number>("number");
        static readonly boolean = new Type<boolean>("boolean");
        static readonly symbol = new Type<symbol>("symbol");

        static readonly regexp = new Type<RegExp>("RegExp");
        static readonly regexparray = new Type<RegExpExecArray>("RegExpExecArray");

        // pseudotypes that break the generality of this class but are convenient
        static readonly integer = new Type<integer>("integer");

        private static readonly typeMap = new Map(); //TODO: safety; TODO: weak map

        // this returns the "Type" instance for the specified class
        static for<T>(ctor:Constructor<T>):Type<T> {
            if(!Type.typeMap.has(ctor)) {
                Type.typeMap.set(ctor,new Type<T>(ctor.name,ctor));
            }

            return Type.typeMap.get(ctor);
        }

        // checks whether two Types are the same, but returning a type guard
        is(other:Type<unsafe>):other is Type<T> {
            return this == other;
        }

        // type.typeOf(x) checks whether "x" is of type "type" and returns a type guard
        typeOf(x:unsafe):x is T {
            if(x === undefined && this == Type.undefined as Type<unsafe>) {
                return true;
            }

            if(x === null && this == Type.null as Type<unsafe>) {
                return true;
            }

            if(typeof x == "string" && this == Type.string as Type<unsafe>) {
                return true;
            }

            if(integer.is(x) && this == Type.integer as Type<unsafe>) {
                return true;
            }

            if(typeof x == "number" && this == Type.number as Type<unsafe>) {
                return true;
            }

            if(typeof x == "boolean" && this == Type.boolean as Type<unsafe>) {
                return true;
            }

            if(typeof x == "symbol" && this == Type.symbol as Type<unsafe>) {
                return true;
            }

            if(this.ctor != undefined) {
                return x instanceof this.ctor;
            }

            return false;
        }
    }
}

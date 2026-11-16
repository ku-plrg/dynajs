/// <reference path="symbolic.ts" />

namespace TSJ$.PSE {
    export type Like<T> = T | Symbolic<T>;

    function isLike<T>(x:unsafe,type:Type<T>):x is Like<T> {
        return (
            type.typeOf(x) ||
            (
                x instanceof Symbolic &&
                x.isType(type)
            )
        );
    }
    

    export function isLikeString(x:anything):x is Like<string> {
        return isLike(x,Type.string);
    }

    export function isLikeBoolean(x:anything):x is Like<boolean> {
        return isLike(x,Type.boolean);
    }

    export function isLikeNumber(x:anything):x is Like<number> {
        return isLike(x,Type.number);
    }

    export function isLikeInteger(x:anything):x is Like<integer> {
        return isLike(x,Type.integer);
    }

    export function isLikeRegexpArray(x:anything):x is Like<RegExpExecArray> {
        return isLike(x,Type.regexparray);
    }

    export class Encoder {
        constructor(
            public readonly valueOfHandler:ValueOfHandler,
        ) {}

        asSymbolicRegex(x:Like<RegExp>):Symbolic<RegExp> {
            if(Symbolic.instanceOf(x)) {
                return x;
            } else {
                return new Symbols.LiteralSymbol(x,Type.regexp,this.valueOfHandler);
            }
        }

        asSymbolicBoolean(x:Like<boolean>):Symbolic<boolean> {
            if(Symbolic.instanceOf(x)) {
                return x;
            } else {
                return new Symbols.LiteralSymbol(x,Type.boolean,this.valueOfHandler);
            }
        }

        asSymbolicString(x:Like<string>):Symbolic<string> {
            if(Symbolic.instanceOf(x)) {
                return x;
            } else {
                return new Symbols.LiteralSymbol(x,Type.string,this.valueOfHandler);
            }
        }

        /*
        asSymbolicNumber(x:Like<number>):Symbolic<number> {
            if(Symbolic.instanceOf(x)) {
                return x;
            } else {
                return new Symbols.LiteralSymbol(x,Type.number,this.valueOfHandler);
            }
        }
        */
    
        asSymbolicInteger(x:Like<integer>):Symbolic<integer> {
            if(Symbolic.instanceOf(x)) {
                return x;
            } else {
                return new Symbols.LiteralSymbol(x,Type.integer,this.valueOfHandler);
            }
        }

        asSymbolicRegexpArray(x:Like<RegExpExecArray>):Symbolic<RegExpExecArray> {
            if(Symbolic.instanceOf(x)) {
                return x;
            } else {
                return new Symbols.LiteralSymbol(x,Type.regexparray,this.valueOfHandler);
            }
        }

        asSymbolic(x:boolean|string|integer|RegExpExecArray|anything):Symbolic<anything> {
            if(isLikeInteger(x)) {
                return this.asSymbolicInteger(x);
            } else if(isLikeBoolean(x)) {
                return this.asSymbolicBoolean(x);
            } else if(isLikeString(x)) {
                return this.asSymbolicString(x);
            } else if(isLikeRegexpArray(x)) {
                return this.asSymbolicRegexpArray(x);
            } else  {
                const nop:string= "nop"
                return new Symbols.LiteralSymbol(nop,Type.string,this.valueOfHandler);;
            }
        }
    }
}

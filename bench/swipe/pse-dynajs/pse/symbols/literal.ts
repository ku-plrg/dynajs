/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class LiteralSymbol<T> extends Symbolic<T> {
        constructor(
            public readonly value:T,
            type:Type<T>,
            valueOfHandler:ValueOfHandler,
        ) {
            super(type,valueOfHandler);
        }
    
        concretize(): T {
            return this.value;
        }

        asSMT(c:SMT.FormatterContext):SMT.S {
            if(this.isType(Type.string)) {
                let value:string = Unsafe.cast(this.value);
                return Util.basicStringEscape(value);
            } else if(this.isType(Type.boolean)) {
                return String(this.value);
            } else if (this.isType(Type.regexp)) {
                let restr:string = reTranslator.translateViaAjax(String(this.value));
                return restr;
            } else if(this.isType(Type.integer)) {
                let value:integer = Unsafe.cast(this.value);
                if(value < 0) {
                    return "(- " + String(-1*value) + ")";
                } else {
                    return String(value);
                }
            } else {
                throw Util.throwInternalError("Unable to convert type",this.type.name,"to a literal SMT string.");
            }
        }
    }
}
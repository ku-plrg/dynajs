/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSplitIndexingHACK extends Symbolic<string> {

        constructor(
            public readonly value:string, //TODO: this should probably be a getter rather than a fixeed value?
            private readonly id:string,
            valueOfHandler:ValueOfHandler,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize():string {
            return this.value;
        }

        asSMT(c:SMT.FormatterContext):SMT.S {
            //TODO: this variables thing is broken
            c.registerVariable(this.id,Type.string);
            return this.id;
        }
    }
}
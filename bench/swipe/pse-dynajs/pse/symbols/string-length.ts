/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringLength extends Symbolic<integer> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
        ) {
            super(Type.integer,valueOfHandler);
        }
    
        concretize(c:Concretizer): integer {
            return integer.cast(c(this.base).length);
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str.len",
                this.base.asSMT(c)
            );
        }
    }
}
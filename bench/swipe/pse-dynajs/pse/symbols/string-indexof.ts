/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringIndexOf extends Symbolic<integer> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly query:Symbolic<string>,
            public readonly start:Symbolic<integer>,
        ) {
            super(Type.integer,valueOfHandler);
        }
    
        concretize(c:Concretizer): integer {
            return integer.cast(
                c(this.base).indexOf(c(this.query),c(this.start))
            );
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str.indexof",
                this.base.asSMT(c),
                this.query.asSMT(c),
                this.start.asSMT(c),
            );
        }
    }
}
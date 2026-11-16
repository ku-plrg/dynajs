/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSplitLength extends Symbolic<integer> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly split:Symbolic<string>,
        ) {
            super(Type.integer,valueOfHandler);
        }
    
        concretize(c:Concretizer): integer {
            return integer.cast(
                c(this.base).split(c(this.split)).length
            );
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str_split_len",
                this.base.asSMT(c),
                this.split.asSMT(c),
            );
        }
    }
}
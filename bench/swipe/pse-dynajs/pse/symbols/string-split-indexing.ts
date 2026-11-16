/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSplitIndexing extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly split:Symbolic<string>,
            public readonly index:Symbolic<integer>,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            return c(this.base).split(c(this.split))[c(this.index)];
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str.split.index",
                this.base.asSMT(c),
                this.split.asSMT(c),
                this.index.asSMT(c),
            );
        }
    }
}
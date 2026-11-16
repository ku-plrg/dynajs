/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class ReTest extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<RegExp>,
            public readonly searchStr:Symbolic<string>
        ) {
            super(Type.boolean,valueOfHandler);
        }
    
        concretize(c:Concretizer): boolean {
            return c(this.base).test(c(this.searchStr));
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str.in.re",
                this.searchStr.asSMT(c),
                this.base.asSMT(c)
            );
        }
    }
}

/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class ReExec extends Symbolic<RegExpExecArray | null> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<RegExp>,
            public readonly searchStr:Symbolic<string>
        ) {
            super(Type.regexparray,valueOfHandler);
        }
    
        concretize(c:Concretizer): RegExpExecArray | null {
            return c(this.base).exec(c(this.searchStr));
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

/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class Not extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly a:Symbolic<boolean>,
        ) {
            super(Type.boolean,valueOfHandler);
        }

        concretize(c:Concretizer): boolean {
            return !c(this.a);
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "not",
                this.a.asSMT(c),
            );
        }
    }
}
/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class BooleanAsInteger extends Symbolic<integer> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly a:Symbolic<boolean>,
        ) {
            super(Type.integer,valueOfHandler);
        }

        concretize(c:Concretizer):integer {
            return c(this.a) ? 1 : 0;
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "ite",
                this.a.asSMT(c),
                "1",
                "0",
            );
        }
    }
}
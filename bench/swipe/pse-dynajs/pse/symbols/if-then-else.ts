/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class IfThenElse<T> extends Symbolic<T> {
        constructor(
            type:Type<T>,
            valueOfHandler:ValueOfHandler,
            public readonly cond:Symbolic<boolean>,
            public readonly a:Symbolic<T>,
            public readonly b:Symbolic<T>
        ) {
            super(type,valueOfHandler);
        }

        concretize(c:Concretizer): T {
            return c(this.cond) ? c(this.a) : c(this.b);
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "ite",
                this.cond.asSMT(c),
                this.a.asSMT(c),
                this.b.asSMT(c),
            );
        }
    }
}
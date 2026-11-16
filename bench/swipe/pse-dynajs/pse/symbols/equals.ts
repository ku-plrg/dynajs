/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class Equals<T> extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly a:Symbolic<T>,
            public readonly b:Symbolic<T>
        ) {
            super(Type.boolean,valueOfHandler);
        }

        concretize(c:Concretizer): boolean {
            return c(this.a) === c(this.b);
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "=",
                this.a.asSMT(c),
                this.b.asSMT(c),
            );
        }
    }

    export function notEquals<T>(
        valueOfHandler:ValueOfHandler,
        a:Symbolic<T>,
        b:Symbolic<T>
    ):Not {
        return new Not(
            valueOfHandler,
            new Equals(
                valueOfHandler,
                a,
                b
            )
        );
    }
}
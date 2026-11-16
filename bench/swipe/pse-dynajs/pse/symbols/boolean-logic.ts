/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    abstract class BooleanOp extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly left:Symbolic<boolean>,
            public readonly right:Symbolic<boolean>,
        ) {
            super(Type.boolean,valueOfHandler);
        }
    }

    export class BooleanAnd extends BooleanOp {
        concretize(c:Concretizer):boolean {
            return c(this.left) && c(this.right);
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "and",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }

    export class BooleanOr extends BooleanOp {
        concretize(c:Concretizer):boolean {
            return c(this.left) || c(this.right);
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "or",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
}
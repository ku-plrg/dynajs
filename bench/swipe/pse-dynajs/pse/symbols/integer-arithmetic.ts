/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    abstract class BinaryArithmetic extends Symbolic<integer> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly left:Symbolic<integer>,
            public readonly right:Symbolic<integer>,
        ) {
            super(Type.integer,valueOfHandler);
        }
    }

    export class IntegerAddition extends BinaryArithmetic {
        concretize(c:Concretizer):integer {
            return integer.add(c(this.left),c(this.right));
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "+",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
    
    export class IntegerSubtraction extends BinaryArithmetic {
        concretize(c:Concretizer):integer {
            return integer.subtract(c(this.left),c(this.right));
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "-",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
}
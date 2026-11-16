/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    abstract class BinaryComparisonSymbol<T> extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly left:Symbolic<T>,
            public readonly right:Symbolic<T>,
        ) {
            super(Type.boolean,valueOfHandler);
        }
    }
    
    export class IntegerLTSymbol extends BinaryComparisonSymbol<integer> {
        concretize(c:Concretizer):boolean {
            return c(this.left) < c(this.right);
        }
        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "<",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
    
    export class IntegerLTEQSymbol extends BinaryComparisonSymbol<integer> {
        concretize(c:Concretizer):boolean {
            return c(this.left) <= c(this.right);
        }
        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "<=",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
    
    export class IntegerGTSymbol extends BinaryComparisonSymbol<integer> {
        concretize(c:Concretizer):boolean {
            return c(this.left) > c(this.right);
        }
        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                ">",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
    
    export class IntegerGTEQSymbol extends BinaryComparisonSymbol<integer> {
        concretize(c:Concretizer):boolean {
            return c(this.left) >= c(this.right);
        }
        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                ">=",
                this.left.asSMT(c),
                this.right.asSMT(c),
            );
        }
    }
}
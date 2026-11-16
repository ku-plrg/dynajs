/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringConcat extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly a:Symbolic<string>,
            public readonly b:Symbolic<string>,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            return c(this.a).concat(c(this.b));
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str.++",
                this.a.asSMT(c),
                this.b.asSMT(c),
            );
        }
    }
}
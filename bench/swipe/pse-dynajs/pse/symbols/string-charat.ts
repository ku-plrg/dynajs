/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringCharAt extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly pos:Symbolic<integer>,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            return c(this.base).charAt(c(this.pos));
        }

        asSMT(c: SMT.FormatterContext): string {
            // the theory says out of range pos will get empty string
            // see http://smtlib.cs.uiowa.edu/theories-UnicodeStrings.shtml
            return SMT.s(
                "str.at",
                this.base.asSMT(c),
                this.pos.asSMT(c),
            );
        }
    }
}
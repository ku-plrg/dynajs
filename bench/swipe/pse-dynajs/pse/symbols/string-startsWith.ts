/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringStartsWith extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly searchStr:Symbolic<string>,
            public readonly pos?:Symbolic<integer>,
        ) {
            super(Type.boolean,valueOfHandler);
        }
    
        concretize(c:Concretizer): boolean {
            if(this.pos == undefined) {
                return c(this.base).startsWith(c(this.searchStr));
            } else {
                return c(this.base).startsWith(c(this.searchStr),c(this.pos));
            }
        }

        asSMT(c: SMT.FormatterContext): string {

            if(this.pos == undefined) {
                // this case is easy, we can directly use str.prefixof
                // ref: http://smtlib.cs.uiowa.edu/theories-UnicodeStrings.shtml
                return SMT.s(
                    "str.prefixof",
                    this.searchStr.asSMT(c),
                    this.base.asSMT(c)
                );
            }
            else {
                return SMT.s(
                    "str.prefixof",
                    this.searchStr.asSMT(c),
                    SMT.s( // need a substr here
                        "str.substr",
                        this.base.asSMT(c),
                        this.pos.asSMT(c),
                        SMT.s(
                            "str.len",
                            this.base.asSMT(c)
                        )
                    )
                );
    
            }
        }
    }
}
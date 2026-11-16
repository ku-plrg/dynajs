/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringIncludes extends Symbolic<boolean> {
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
                return c(this.base).includes(c(this.searchStr));
            } else {
                return c(this.base).includes(c(this.searchStr),c(this.pos));
            }
        }

        asSMT(c: SMT.FormatterContext): string {
            if(this.pos == undefined) {
                // this case is easy, we can directly use str.contains
                // ref: http://smtlib.cs.uiowa.edu/theories-UnicodeStrings.shtml
                return SMT.s(
                    "str.contains",
                    this.base.asSMT(c),
                    this.searchStr.asSMT(c)
                );
            }
            else {
                return SMT.s(
                    "str.contains",
                    SMT.s( // need a substr here
                        "str.substr",
                        this.base.asSMT(c),
                        this.pos.asSMT(c),
                        SMT.s(
                            "str.len",
                            this.base.asSMT(c)
                        )
                    ),
                    this.searchStr.asSMT(c)
                );
    
            }
        }
    }
}
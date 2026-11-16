/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringEndsWith extends Symbolic<boolean> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly searchStr:Symbolic<string>,
            public readonly len?:Symbolic<integer>,
        ) {
            super(Type.boolean,valueOfHandler);
        }
    
        concretize(c:Concretizer): boolean {
            if(this.len == undefined) {
                return c(this.base).endsWith(c(this.searchStr));
            } else {
                return c(this.base).endsWith(c(this.searchStr),c(this.len));
            }
        }

        asSMT(c: SMT.FormatterContext): string {
            if(this.len == undefined) {
                // this case is easy, we can directly use str.suffixof
                // ref: http://smtlib.cs.uiowa.edu/theories-UnicodeStrings.shtml
                return SMT.s(
                    "str.suffixof",
                    this.searchStr.asSMT(c),
                    this.base.asSMT(c)
                );
            }
            else {
                return SMT.s(
                    "str.suffixof",
                    this.searchStr.asSMT(c),
                    SMT.s( // need a substr here
                        "str.substr",
                        this.base.asSMT(c),
                        "0",
                        this.len.asSMT(c),
                    )
                );
    
            }
        }
    }
}
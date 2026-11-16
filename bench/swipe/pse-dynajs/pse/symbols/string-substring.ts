/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSubstring extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly a:Symbolic<integer>,
            public readonly b?:Symbolic<integer>,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            if(this.b == undefined) {
                return c(this.base).substring(c(this.a));
            } else {
                return c(this.base).substring(c(this.a),c(this.b));
            }
        }

        asSMT(c: SMT.FormatterContext): string {
            
            // note: the case of a > b and swapping the two is handled
            // in the preamble
            
            //TODO: what happens for negative numbers? do things explode?
            return SMT.s(
                "str_substring",
                this.base.asSMT(c),
                this.a.asSMT(c),
                this.b !== undefined
                    ? this.b.asSMT(c)
                    : SMT.s("str.len",
                        this.base.asSMT(c)
                    )
            );
        }
    }
}

/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSlice extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly bI:Symbolic<integer>,
            public readonly eI?:Symbolic<integer>,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            if(this.eI == undefined) {
                return c(this.base).slice(c(this.bI));
            } else {
                return c(this.base).slice(c(this.bI),c(this.eI));
            }
        }

        asSMT(c: SMT.FormatterContext): string {

            // need to think about -ve indices, see the link below
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice#Parameters
            // maybe it'd be easier to handle this in the preamble
            // just like the substring a > b case

            return SMT.s(
                "str_slice",
                this.base.asSMT(c),
                this.bI.asSMT(c),
                this.eI !== undefined
                    ? this.eI.asSMT(c)
                    : SMT.s("str.len",
                        this.base.asSMT(c)
                    )
            );
        }
    }
}
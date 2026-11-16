/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSubstr extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly start:Symbolic<integer>,
            public readonly len?:Symbolic<integer>,
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            if(this.len == undefined) {
                return c(this.base).substr(c(this.start));
            } else {
                return c(this.base).substr(c(this.start),c(this.len));
            }
        }

        asSMT(c: SMT.FormatterContext): string {
            //TODO: do we need to cap len between 0 and string length?
            return SMT.s(
                "str.substr",
                this.base.asSMT(c),
                this.start.asSMT(c),
                this.len !== undefined
                    ? this.len.asSMT(c)
                    : "999999" //TODO: fix this hack
            );
        }
    }
}
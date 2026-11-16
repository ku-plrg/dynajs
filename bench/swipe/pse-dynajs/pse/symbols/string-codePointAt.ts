/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringCodePointAt extends Symbolic<number> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly pos:Symbolic<integer>,
        ) {
            super(Type.integer,valueOfHandler);
        }
    
        concretize(c:Concretizer): integer {
            let n = c(this.base).codePointAt(c(this.pos));
 	    //@ts-ignore
	    if (Saved.isNaN(n) || n === undefined) { // this would happen if pos is out of range
                return (n as any);
            } else { 
                return integer.cast(n);
            }
        }

        asSMT(c: SMT.FormatterContext): string {
            // the theory says out of range pos will get empty string
            // see http://smtlib.cs.uiowa.edu/theories-UnicodeStrings.shtml
            return SMT.s(
                "str.to_code",
                SMT.s(
                    "str.at",
                    this.base.asSMT(c),
                    this.pos.asSMT(c),
                )
            );
        }
    }
}

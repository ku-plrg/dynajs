/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringToUpperCase extends Symbolic<string> {
        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>
        ) {
            super(Type.string,valueOfHandler);
        }
    
        concretize(c:Concretizer): string {
            return c(this.base).toUpperCase();
        }

        asSMT(c: SMT.FormatterContext): string {

            // if we want we can handle this in the solver interface python script
            REGISTER_TOUPLOWCASE(this.base.asSMT(c), "UpperCase");

            // just pass through
            return this.base.asSMT(c);
        }
    }
}
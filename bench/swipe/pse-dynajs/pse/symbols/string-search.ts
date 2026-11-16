/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringSearch extends Symbolic<integer> {

        s1 :string;
        s2 :string;
        s3 :string;

        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly searchStr:RegExp,
        ) {
            super(Type.integer,valueOfHandler);

            // get intermediate string variables
            this.s1 = GetIntermediateSymVar();
            this.s2 = GetIntermediateSymVar();
            this.s3 = GetIntermediateSymVar();

            // do OOB declarations
            remoteLogger.sendMessage("OOB-DECL", {
                name: this.s1,
                type: "String" // SMT2LIB types
            });
            remoteLogger.sendMessage("OOB-DECL", {
                name: this.s2,
                type: "String" // SMT2LIB types
            });
            remoteLogger.sendMessage("OOB-DECL", {
                name: this.s3,
                type: "String" // SMT2LIB types
            });            

            // console.log("searchStr.source = " + searchStr.source);

            let pattern1 = reTranslator.translateViaAjax('/'+searchStr.source+'/');
            let pattern2 = reTranslator.translateViaAjax('/^'+searchStr.source+'$/');

            let smtCtx = new SMT.FormatterContext();

            // send additional constraints here
            remoteLogger.sendMessage("ADD-CONSTR",{
                Constraint_1: SMT.s("=",
                    this.base.asSMT(smtCtx),
                    SMT.s("str.++",
                        this.s1,
                        SMT.s("str.++",
                            this.s2,
                            this.s3
                        )
                    )
                ),
                Constraint_2: SMT.s("not",
                    SMT.s(
                        "str.in.re",
                        this.s1,
                        pattern1
                    )
                ),
                Constraint_3: SMT.s(
                    "str.in.re",
                    this.s2,
                    pattern2           
                )
            });


        }
    
        concretize(c:Concretizer): integer {
            return integer.cast(
                c(this.base).search(this.searchStr)
            );
        }

        asSMT(c: SMT.FormatterContext): string {
            c.registerVariable(this.s1, Type.string);
            c.registerVariable(this.s2, Type.string);
            c.registerVariable(this.s3, Type.string);
            return SMT.s(
                "str.len",
                this.s1
            );
        }
    }
}
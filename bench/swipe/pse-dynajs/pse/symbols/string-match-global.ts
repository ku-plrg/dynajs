/// <reference path="../symbolic.ts" />

namespace TSJ$.PSE.Symbols {
    export class StringMatchGlobal extends Symbolic<RegExpMatchArray> {

        mStr : Array<string>;
        nStr : Array<string>;

        constructor(
            valueOfHandler:ValueOfHandler,
            public readonly base:Symbolic<string>,
            public readonly searchStr:RegExp,
        ) {
            super(Type.regexparray, valueOfHandler);

            this.mStr = [];
            this.nStr = [];

            for (let i = 0; i < Config.bound_on_string_match; i++) {
                // get intermediate string variables
                this.mStr[i] = GetIntermediateSymVar();

                // do OOB declarations
                remoteLogger.sendMessage("OOB-DECL", {
                    name: this.mStr[i],
                    type: "String" // SMT2LIB types
                });
            }

            for (let i = 0; i < Config.bound_on_string_match+1; i++) {
                // get intermediate string variables               
                this.nStr[i] = GetIntermediateSymVar();

                // do OOB declarations
                remoteLogger.sendMessage("OOB-DECL", {
                    name: this.nStr[i],
                    type: "String" // SMT2LIB types
                });                
            }

            let re = reTranslator.translateViaAjax('/'+searchStr.source+'/');
            let bre = reTranslator.translateViaAjax('/^'+searchStr.source+'$/');

            let smtCtx = new SMT.FormatterContext();

            // send additional constraints here
            for (let i = 0; i < Config.bound_on_string_match+1; i++) {
                remoteLogger.sendMessage("ADD-CONSTR",{
                    Constraint_1: SMT.s("not",
                        SMT.s(
                            "str.in.re",
                            this.nStr[i],
                            re
                        )
                    )
                });
            }
            for (let i = 0; i < Config.bound_on_string_match; i++) {
                remoteLogger.sendMessage("ADD-CONSTR",{
                    Constraint_1: SMT.s(
                        "str.in.re",
                        this.mStr[i],
                        bre
                    )
                });
            }
            let summation = this.nStr[Config.bound_on_string_match];
            for (let i = Config.bound_on_string_match-1; i >= 0; i--) {
                summation = SMT.s("str.++",
                                this.nStr[i],
                                SMT.s("str.++",
                                    this.mStr[i],
                                    summation
                                )
                            );
            }
            remoteLogger.sendMessage("ADD-CONSTR",{
                Constraint_1: SMT.s("=",
                    this.base.asSMT(smtCtx),
                    summation
                )
            });

            StrMatchGlobalStackPush(this.mStr);

        }
    
        concretize(c:Concretizer): RegExpMatchArray {
            let ret = c(this.base).match(this.searchStr);

            // are we creating multiple instances of the same ret with multiple concretize calls?
            //REMOVELOG console.log('[-] type of reg = ', typeof ret);

            if (ret !== null) {
                //REMOVELOG console.log('[-] string-match-global concretize return this '+String(ret));
                return ret;
            } else {
                //REMOVELOG console.log('[-] string-match-global concretize return [""]');
                return [""];
            }
        }

        asSMT(c: SMT.FormatterContext): string {
            return SMT.s(
                "str.len",
                this.mStr[0]
            );
        }
    }
}
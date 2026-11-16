namespace TSJ$.PSE.Models {
    export const Regex_exec:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.base instanceof RegExp &&
            call.f === Saved.Re_exec &&
            Config.regex_model
        ) {

            const searchStr = call.args[0];
            if(
                call.base instanceof RegExp &&
                Symbolic.instanceOf(searchStr)
                && isLikeString(searchStr)
            ){
                //REMOVELOG console.log('[+] regex-exec: symbolic arg');
                // REGISTER_OOB("s1", "");
                // REGISTER_OOB("s2", "");
                // REGISTER_OOB("s3", "");
                // REGISTER_SYMBOLIC("s1");
                // REGISTER_SYMBOLIC("s2");
                // REGISTER_SYMBOLIC("s3");
            

                //REMOVELOG console.log("call.base.lastIndex = "+call.base.lastIndex);

                // return undefined;
                
                // return new ReturnEffect(new Symbols.ReExec(
                //     context.encoder.valueOfHandler,
                //     context.encoder.asSymbolicRegex(call.base),
                //     context.encoder.asSymbolicString(searchStr)
                // ));

                //REMOVELOG console.log("Symbolic:exec:"+call.base)
                //REMOVELOG console.log(call.args[0])
                //REMOVELOG console.log(call.base)
                remoteLogger.sendMessage(
                    "regexcase",
                    {
                            function : "exec",
                            pattern : call.base.toString(),
                        
                    }
		        );
                
		        return undefined;
            }
            //console.log("Not symblic:exec");
            return undefined;
        }
        return undefined;
    }
}

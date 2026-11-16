namespace TSJ$.PSE.Models {
    export const String_split_regex:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.args[0] instanceof RegExp &&
            call.f === String.prototype.split &&
            Config.regex_model
        ) {
            if(
              Symbolic.instanceOf(call.base)
            ) {
                //REMOVELOG console.log('[+] string-split-regex: symbolic base');
                if (!isLikeString(call.base)){
                    remoteLogger.sendMessage(
                        "missing_models",
                        {
                            function : "string-split-regex"
                        }
                    );
                }
                return undefined;
            }
            //REMOVELOG console.log('[+] string-split-regex: concrete base');
            return undefined;
        }
        return undefined;
    }
}

namespace TSJ$.PSE.Models {
    export const String_match_regex:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.args[0] instanceof RegExp &&
            call.f === Saved.String_match &&
            isLikeString(call.base) &&
            Config.regex_model
        ) {

            const re = call.args[0];

            if(
              Symbolic.instanceOf(call.base) &&
              re instanceof RegExp // this is needed 'coz type checking is a little sloppy w/ indexed array elements
            ) {
                //console.log("Symbolic:match")
                // remoteLogger.sendMessage("regexcase",{
                //     function : "match",
                //     pattern : call.args[0]!.toString()
                // });
                // return undefined;

                if (re.global) {

                    return new ReturnEffect(new Symbols.StringMatchGlobal(
                        context.encoder.valueOfHandler,
                        context.encoder.asSymbolicString(call.base),
                        re
                    ));

                } else { /* non-global match is same as RegExp.exec() */

                    /* assumes we do not handle named capture groups */

                // return new ReturnEffect(new Symbols.ReExec(
                //     context.encoder.valueOfHandler,
                //     context.encoder.asSymbolicRegex(call.base),
                //     context.encoder.asSymbolicString(searchStr)
                // ));

                }

            }
            //console.log("Not symblic:match");
            return undefined;
        }
        return undefined;
    }
}

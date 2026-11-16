namespace TSJ$.PSE.Models {
    export const String_substr:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_substr &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]) || Symbolic.instanceOf(call.args[1]))
        ) {
            const start = call.args[0];
            const len = call.args[1];
            if(
                isLikeInteger(start) &&
                (
                    len === undefined ||
                    isLikeInteger(len)
                )
            ) {
                //REMOVELOG console.log('[+] string-substr: symbolic');
                return new ReturnEffect(new Symbols.StringSubstr(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicInteger(start),
                    len === undefined
                        ? undefined
                        : context.encoder.asSymbolicInteger(len)
                ));
            }
        }
        return;
    }
}

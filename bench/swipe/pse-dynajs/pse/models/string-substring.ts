namespace TSJ$.PSE.Models {
    export const String_substring:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_substring &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]) || Symbolic.instanceOf(call.args[1]))
        ) {
            //TODO: negative numbers?
            const start = call.args[0];
            const end = call.args[1];
            if(
                isLikeInteger(start) &&
                (
                    end === undefined ||
                    isLikeInteger(end)
                )
            ) {
                //REMOVELOG console.log('[+] string-substring: symbolic');
                return new ReturnEffect(new Symbols.StringSubstring(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicInteger(start),
                    end === undefined
                        ? undefined
                        : context.encoder.asSymbolicInteger(end)
                ));
            }
        }
        return;
    }
}

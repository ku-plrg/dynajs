namespace TSJ$.PSE.Models {
    export const String_endsWith:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_endsWith &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]) || Symbolic.instanceOf(call.args[1]))
        ) {
            const searchStr = call.args[0];
            const len = call.args[1];
            if(
                isLikeString(searchStr) &&
                (
                    len === undefined ||
                    isLikeInteger(len)
                )
            ) {
                //REMOVELOG console.log('[+] string-endswith: symbolic');
                return new ReturnEffect(new Symbols.StringEndsWith(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicString(searchStr),
                    len === undefined
                        ? undefined
                        : context.encoder.asSymbolicInteger(len)
                ));
            }
        }
        return;
    }
}

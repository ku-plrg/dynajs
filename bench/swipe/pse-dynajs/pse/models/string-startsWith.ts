namespace TSJ$.PSE.Models {
    export const String_startsWith:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_startsWith &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]) || Symbolic.instanceOf(call.args[1]))
        ) {
            const searchStr = call.args[0];
            const pos = call.args[1];
            if(
                isLikeString(searchStr) &&
                (
                    pos === undefined ||
                    isLikeInteger(pos)
                )
            ) {
                //REMOVELOG console.log('[+] string-startswith: symbolic');
                return new ReturnEffect(new Symbols.StringStartsWith(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicString(searchStr),
                    pos === undefined
                        ? undefined
                        : context.encoder.asSymbolicInteger(pos)
                ));
            }
        }
        return;
    }
}

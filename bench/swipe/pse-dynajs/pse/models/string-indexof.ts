namespace TSJ$.PSE.Models {
    export const String_indexOf:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_indexOf &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]) || Symbolic.instanceOf(call.args[0]))
        ) {
            const query = call.args[0];
            const start = call.args[1];
            if(
                isLikeString(query) &&
                (
                    start === undefined ||
                    isLikeInteger(start)
                )
            ) {
                //REMOVELOG console.log('[+] string-indexof: symbolic'); 
                return new ReturnEffect(new Symbols.StringIndexOf(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicString(query),
                    start === undefined
                        ? context.encoder.asSymbolicInteger(0)
                        : context.encoder.asSymbolicInteger(start)
                ));
            }
        }
        return;
    }
}

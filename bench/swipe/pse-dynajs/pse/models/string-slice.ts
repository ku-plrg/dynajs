namespace TSJ$.PSE.Models {
    export const String_slice:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_Slice &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]) || Symbolic.instanceOf(call.args[1]))
        ) {
            const bI = call.args[0];
            const eI = call.args[1];
            if(
                isLikeInteger(bI) &&
                (
                    eI === undefined ||
                    isLikeInteger(eI)
                )
            ) {
                console.log('[+] string-slice: symbolic');
                return new ReturnEffect(new Symbols.StringSlice(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicInteger(bI),
                    eI === undefined
                        ? undefined
                        : context.encoder.asSymbolicInteger(eI)
                ));
            }
        }
        return;
    }
}

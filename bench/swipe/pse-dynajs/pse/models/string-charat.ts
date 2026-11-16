namespace TSJ$.PSE.Models {
    export const String_charAt:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_charAt &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]))
        ) {
            const pos = call.args[0];
            if(isLikeInteger(pos))
            {
                //REMOVELOG console.log('[+] string-charat: symbolic');
                return new ReturnEffect(new Symbols.StringCharAt(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicInteger(pos)
                ));
            }
        }
        return;
    }
}

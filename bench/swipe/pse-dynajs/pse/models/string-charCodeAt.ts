namespace TSJ$.PSE.Models {
    export const String_charCodeAt:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_charCodeAt &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]))
        ) {
            const pos = call.args[0];
            if(isLikeInteger(pos))
            {
                //REMOVELOG console.log('[+] string-charcodeat: symbolic');
                return new ReturnEffect(new Symbols.StringCharCodeAt(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicInteger(pos)
                ));
            }
        }
        return;
    }
}

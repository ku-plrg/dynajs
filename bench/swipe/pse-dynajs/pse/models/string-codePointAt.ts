namespace TSJ$.PSE.Models {
    export const String_CodePointAt:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_codePointAt &&
            isLikeString(call.base) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.args[0]))
        ) {
            const pos = call.args[0];
            if(isLikeInteger(pos))
            {
                //REMOVELOG console.log('[+] string-codepointat: symbolic');
                return new ReturnEffect(new Symbols.StringCodePointAt(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.base),
                    context.encoder.asSymbolicInteger(pos)
                ));
            }
        }
        return;
    }
}

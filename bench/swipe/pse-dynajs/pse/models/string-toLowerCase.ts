namespace TSJ$.PSE.Models {
    export const String_toLowerCase:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_toLowerCase &&
            isLikeString(call.base) &&
            Symbolic.instanceOf(call.base)
        ) {
            ///REMOVELOG console.log('[+] string-tolowercase: symbolic');
            return new ReturnEffect(new Symbols.StringToLowerCase(
                context.encoder.valueOfHandler,
                context.encoder.asSymbolicString(call.base)
            ));
        }
        return;
    }
}

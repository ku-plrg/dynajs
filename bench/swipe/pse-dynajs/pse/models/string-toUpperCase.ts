namespace TSJ$.PSE.Models {
    export const String_toUpperCase:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_toUpperCase &&
            isLikeString(call.base) &&
            Symbolic.instanceOf(call.base)
        ) {
            //REMOVELOG console.log('[+] string-touppercase: symbolic');
            return new ReturnEffect(new Symbols.StringToUpperCase(
                context.encoder.valueOfHandler,
                context.encoder.asSymbolicString(call.base)
            ));
        }
        return;
    }
}

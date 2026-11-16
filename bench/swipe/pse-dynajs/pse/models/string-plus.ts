namespace TSJ$.PSE.Models {
    export const String_plus:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.BinaryCall &&
            call.op == "+" &&
            isLikeString(call.left) &&
            isLikeString(call.right) &&
            ( Symbolic.instanceOf(call.left) || Symbolic.instanceOf(call.right) )
        ) {
            //REMOVELOG console.log('[+] string-plus: symbolic');
            const left = call.left;
            const right = call.right;

            return new ReturnEffect(new Symbols.StringConcat(
                context.encoder.valueOfHandler,
                context.encoder.asSymbolicString(left),
                context.encoder.asSymbolicString(right),
            ));
        }
        return;
    }
}

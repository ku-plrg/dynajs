namespace TSJ$.PSE.Models {
    export const not:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.UnaryCall &&
            call.op === "!" &&
            Symbolic.instanceOf(call.left)
        ) {
            if(
                // we don't handle number here, as we haven't implemented
                // coercing a number to a boolean. instead it will fall
                // through to unhandled and thus concretization
                supportedForBooleanCoercion(call.left)
            ) {
                //REMOVELOG console.log('[+] not: symbolic call.left');
                const symbolicBool:Symbolic<boolean>
                    = coerceToBoolean(context,call.left);
                return new ReturnEffect(new Symbols.Not(
                    context.encoder.valueOfHandler,
                    symbolicBool
                ));
            }
        }
        return;
    }
}
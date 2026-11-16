namespace TSJ$.PSE.Models {
    export const String_length:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.GetFieldCall &&
            isLikeString(call.base) &&
            Symbolic.instanceOf(call.base) &&
            call.offset === "length"
        ) {
            //console.log(call.base);
            return new ReturnEffect(new Symbols.StringLength(
                context.encoder.valueOfHandler,
                context.encoder.asSymbolicString(call.base),
            ));
        }
        return;
    }
}

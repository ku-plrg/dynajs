namespace TSJ$.PSE.Models {
    export const String_indexing:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.GetFieldCall &&
            isLikeString(call.base) &&
            isLikeInteger(call.offset) &&
            (Symbolic.instanceOf(call.base) || Symbolic.instanceOf(call.offset))
        ) {
            const base = context.encoder.asSymbolicString(call.base);
            const index = context.encoder.asSymbolicInteger(call.offset);
            return ValueChoosingEffect.from((c) => {
                const strLen = new Symbols.StringLength(
                    context.encoder.valueOfHandler,
                    base,
                );
                const lowerBound = new Symbols.IntegerGTEQSymbol(
                    context.encoder.valueOfHandler,
                    index,
                    context.encoder.asSymbolicInteger(0),
                );
                const upperBound = new Symbols.IntegerLTSymbol(
                    context.encoder.valueOfHandler,
                    index,
                    strLen,
                );
                const inBounds:boolean = c(
                    new Symbols.BooleanAnd(
                        context.encoder.valueOfHandler,
                        lowerBound,
                        upperBound,
                    ),
                    "string_indexing",
                );
                if(inBounds) {
                    return new ReturnEffect(
                        new Symbols.StringCharAt(
                            context.encoder.valueOfHandler,
                            base,
                            index,
                        )
                    );
                } else {
                    // return undefined
                    return new ReturnEffect(""[-1]);
                }
            });
        }
        return;
    }
}

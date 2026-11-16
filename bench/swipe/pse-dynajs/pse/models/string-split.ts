namespace TSJ$.PSE.Models {
    export const String_split:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_split &&
            isLikeString(call.base)
        ) {
            const base = call.base;
            const split = call.args[0];
            if(
                isLikeString(split)
            ) {
                //REMOVELOG console.log('[+] string-split');
                return ValueChoosingEffect.from((chooser) => {
                    const len:integer = chooser(
                        new Symbols.StringSplitLength(
                            context.encoder.valueOfHandler,
                            context.encoder.asSymbolicString(base),
                            context.encoder.asSymbolicString(split),
                        ),
                        "string_split_length"
                    )

                    // we need a reversible effect (rather than just a
                    // return effect) because we're returning a mutable object
                    return ReversibleEffect.from(() => {
                        let ret = [];
                        for(let i = 0; i < len; i ++) {
                            ret[i] = new Symbols.StringSplitIndexing(
                                context.encoder.valueOfHandler,
                                context.encoder.asSymbolicString(base),
                                context.encoder.asSymbolicString(split),
                                context.encoder.asSymbolicInteger(integer.cast(i)),
                            )
                        }
    
                        return {next: new ReturnEffect(ret)};
                    });
                });
            }
        }
        return;
    }
}
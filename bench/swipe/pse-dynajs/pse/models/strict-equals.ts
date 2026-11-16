namespace TSJ$.PSE.Models {
    export const strictEquals:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.BinaryCall &&
            (
                call.op == "===" ||
                call.op == "!=="
            ) &&
            (
                Symbolic.instanceOf(call.left) ||
                Symbolic.instanceOf(call.right)
            )
        ) {
            const negate = call.op == "!==";
            let ret:Symbolic<boolean> = (null as any);
            if(
                isLikeString(call.left) &&
                isLikeString(call.right)
            ) {
                //REMOVELOG console.log('[+] strict-equals: symbolic string')
                ret = new Symbols.Equals(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicString(call.left),
                    context.encoder.asSymbolicString(call.right),
                );
            } else if(
                isLikeBoolean(call.left) &&
                isLikeBoolean(call.right)
            ) {
                //REMOVELOG console.log('[+] strict-equals: symbolic boolean');
                ret = new Symbols.Equals(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicBoolean(call.left),
                    context.encoder.asSymbolicBoolean(call.right),
                );
            } else if (
                (isLikeInteger(call.left) || isLikeNumber(call.left)) &&
                (isLikeInteger(call.right) || isLikeNumber(call.right))
            ) {
                if(
                    isLikeInteger(call.left) &&
                    isLikeInteger(call.right)
                ) {
                    //REMOVELOG console.log('[+] strict-equals: symbolic integer');
                    ret = new Symbols.Equals(
                        context.encoder.valueOfHandler,
                        context.encoder.asSymbolicInteger(call.left),
                        context.encoder.asSymbolicInteger(call.right),
                    );
                } else {
                    //TODO: handle floats
                    return;
                }
            } else if (
                (call.left === undefined || call.right === undefined) 
            ) {
                return new ReturnEffect(
                   context.encoder.asSymbolicBoolean(negate) // symbolic object should not be undefined
                );
            } else {
                if (isLikeRegexpArray(call.left) || isLikeRegexpArray(call.right)){
                    remoteLogger.sendMessage(
                        "missing_models",
                        {
                            function : "strict-equals",
                            operator: call.op.toString(),
                            type: "regexparray"
                        }
                    );
                }
                //REMOVELOG console.log('[+] strict-equals: heterogeneous');
                // heterogeneous types always result in false for strict equality
                if (call.op === "===") {
                    return new ReturnEffect(
                        context.encoder.asSymbolicBoolean(false) // tainted false
                    );
                }
                if (call.op === "!==") {
                    return new ReturnEffect(
                        context.encoder.asSymbolicBoolean(true) // tainted true
                    );
                }                
            }
            return new ReturnEffect(
                maybeNegate(
                    negate,
                    context,
                    ret
                )
            );
        }
        return;
    }

    function maybeNegate(
        negate:boolean,
        context:ModelingContext,
        x:Symbolic<boolean>,
    ):Symbolic<boolean> {
        return negate
            ? new Symbols.Not(context.encoder.valueOfHandler,x)
            : x;
    }
}

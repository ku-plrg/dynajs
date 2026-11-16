namespace TSJ$.PSE.Models {
    export const coerciveEquals:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.BinaryCall &&
            (
                call.op == "==" ||
                call.op == "!="
            )
        ) {
            const negate = call.op == "!=";
            if(
                isLikeString(call.left) &&
                isLikeString(call.right)
            ) {
                //REMOVELOG console.log('[+] coercive-equals: string');
                return new ReturnEffect(
                    maybeNegate(
                        negate,
                        context,
                        new Symbols.Equals(
                            context.encoder.valueOfHandler,
                            context.encoder.asSymbolicString(call.left),
                            context.encoder.asSymbolicString(call.right),
                        )
                    )
                );
            } else if(
                (isLikeInteger(call.left) || isLikeBoolean(call.left)) &&
                (isLikeInteger(call.right) || isLikeBoolean(call.right))
            ) {
                //REMOVELOG console.log('[+] coercive-equals: int or bool');
                return new ReturnEffect(
                    maybeNegate(
                        negate,
                        context,
                        new Symbols.Equals(
                            context.encoder.valueOfHandler,
                            asInteger(context,call.left),
                            asInteger(context,call.right),
                        )
                    )
                );
            } else {
                if (isLikeRegexpArray(call.left) || isLikeRegexpArray(call.right)){
                    remoteLogger.sendMessage(
                        "missing_models",
                        {
                            function : "coercive-equals",
                            operator: call.op.toString(),
                            type: "regexparray"
                        }
                    );
                }
                
                // Check if we need to support coercion between string and booleans
                if(
                    (isLikeString(call.left) || isLikeBoolean(call.left)) &&
                    (isLikeString(call.right) || isLikeBoolean(call.right))
                ) {
                    remoteLogger.sendMessage(
                        "missing_models",
                        {
                            function : "coercive-equals",
                            operator: call.op.toString(),
                            type: "string-boolean-coercion",
			    right_side: call.right.toString(),
			    left_side: call.left.toString()
                        }
                    );
                }

                // Check if we need to support coercion between string and integer
                if(
                    (isLikeString(call.left) || isLikeInteger(call.left)) &&
                    (isLikeString(call.right) || isLikeInteger(call.right))
                ) {
                    // Chose to implement an under-approximating model
                    //REMOVELOG console.log('[+] coercive-equals: string and integer');
                    if (isLikeString(call.left)){
                        return new ReturnEffect(
                            maybeNegate(
                                negate,
                                context,
                                new Symbols.Equals(
                                    context.encoder.valueOfHandler,
                                    context.encoder.asSymbolicString(call.left),
                                    context.encoder.asSymbolicString(call.right.toString()),
                                )
                            )
                        );
                    }
                    else if (isLikeString(call.right)) {
                        return new ReturnEffect(
                            maybeNegate(
                                negate,
                                context,
                                new Symbols.Equals(
                                    context.encoder.valueOfHandler,
                                    context.encoder.asSymbolicString(call.left.toString()),
                                    context.encoder.asSymbolicString(call.right),
                                )
                            )
                        );
                    }

                    else {
                        remoteLogger.sendMessage(
                            "missing_models",
                            {
                                function : "coercive-equals",
                                operator: call.op.toString(),
                                type: "string-integer-coercion",
                                left_side: call.left.toString(),
                                right_side: call.right.toString()
                            }
                        );
                    }
                }

                //TODO: handle floats
                //TODO: handle some coercions?
            }
        }
        return;
    }

    function asInteger(
        context:ModelingContext,
        x:(Like<integer>|Like<boolean>)
    ):Symbolic<integer> {
        if(isLikeBoolean(x)) {
            return new Symbols.BooleanAsInteger(
                context.encoder.valueOfHandler,
                context.encoder.asSymbolicBoolean(x)
            );
        } else {
            return context.encoder.asSymbolicInteger(x);
        }
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

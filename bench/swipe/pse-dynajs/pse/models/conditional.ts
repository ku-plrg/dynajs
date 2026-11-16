namespace TSJ$.PSE.Models {
    export const conditional:PartialModeler = (call,context):Effect|undefined => {
        if(call instanceof Hook.ConditionalCall) {

            // console.log("typeof call.condition = "+(typeof call.condition));
            // console.log("\t"+Util.basicDebugToString(call.condition));

            if(
                // typeof call.condition !== 'string' &&
                // ! (call.condition instanceof String) && 
                Symbolic.instanceOf(call.condition)
            ) {
                //REMOVELOG console.log('[+] conditional: symbolic call.condition');
                const symbolicCondition = call.condition;
                if(
                    // we don't handle number here, as we haven't implemented
                    // coercing a number to a boolean. instead it will fall
                    // through to unhandled and thus concretization
                    supportedForBooleanCoercion(symbolicCondition)
                ) {

                    const symbolicBool:Symbolic<boolean>
                        = coerceToBoolean(context,symbolicCondition);
                    // console.warn("  as bool:",symbolicBool);
                    return new class extends ValueChoosingEffect {
                        do(chooser: ValueChooser): Effect {

                            let concBool = chooser(symbolicBool,"conditional_modeled");

                            if(concBool) {
                                // symbolicCondition is a symbol, so it is truthy

                                return new ReturnEffect(symbolicCondition);
                            } else {

                                // by pure luck, there is exactly one falsey value for each type we want to support for now (notably untrue for numbers)
                                // if there were more, we would need a way of simultaneously telling jalangi2 to take the "false fork" and to return a symbol, which would require modifying jalangi2
                                //TODO: actually, if we wanted to track the taint of these conditionals, we need to modify jalangi2 as mentioned above... it's probably not a very important kind of taint tracking, but...
                                if(symbolicCondition.isType(Type.string)) {
                                    return new ReturnEffect("")
                                } else if(symbolicCondition.isType(Type.boolean)) {
                                    return new ReturnEffect(false);
                                } else /* if(symbolicCondition.isType(Type.integer)) */ {
                                    return new ReturnEffect(0);
                                }
                            }
                        }
                    }
                } else {

                    return new class extends ValueChoosingEffect {
                        do(chooser: ValueChooser): Effect {
                            return new ReturnEffect(chooser(symbolicCondition,"conditional_unmodeled"));
                        }
                    }
                }
            }
        }
        return;
    }

    //TODO: since these are shared, they should really go somewhere else
    export function supportedForBooleanCoercion(
        x:Symbolic<anything>
    ):x is Symbolic<string|boolean|integer> {
        return (
            x.isType(Type.string) ||
            x.isType(Type.boolean) ||
            x.isType(Type.integer)
        );
    }

    export function coerceToBoolean<T extends string|boolean|integer>(
        context:ModelingContext,
        x:Symbolic<T>
    ):Symbolic<boolean> {
        if(x.isType(Type.boolean)) {
            return x;
        } else if(x.isType(Type.string)) {
            return Symbols.notEquals(
                context.encoder.valueOfHandler,
                x,
                context.encoder.asSymbolicString("")
            );
        } else if(x.isType(Type.integer)) {
            return Symbols.notEquals(
                context.encoder.valueOfHandler,
                x,
                context.encoder.asSymbolicInteger(0)
            );
        } else {
            throw Util.throwInternalError("Could not coerce symbol of type",x.type.name,"to boolean.");
        }
    }
}

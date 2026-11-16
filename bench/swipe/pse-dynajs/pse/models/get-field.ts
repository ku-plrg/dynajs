namespace TSJ$.PSE.Models {
    export const getField:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.GetFieldCall &&
            Array.isArray(call.base) &&
            call.offset == "length" &&
            call.base.length > 0 &&
            Symbolic.instanceOf(call.base[0]) &&
            Config.split_heuristic
        ) {
            // @ts-ignore
            CHECK_SYMBOLIC(call.base[0].id) // This heuristic will record the behavior when the length of return array is access 
        }
        if(
            call instanceof Hook.GetFieldCall
        ) {
            const offset = call.offset;
            if(
                Symbolic.instanceOf(offset)
            ) {
                return ValueChoosingEffect.from((c) => {
                    return context.model(
                        new Hook.GetFieldCall(
                            call.base,
                            c(offset,"get_field_symbolic_offset"),
                        )
                    );
                });
            }

            if(
                Symbolic.instanceOf(call.base)
            ) {

                //REMOVELOG console.log("[-] getField call.base = ",(call.base));

                // string length and string indexing should already have been tried
                // offset is not symbolic if we get here
                return new ReturnEffect(
                    Unsafe.getField(defaultValueForType(call.base.type),call.offset)
                );
            }

            return ReversibleEffect.from(() => {
                // this has to happen in a reversible effect (rather than using
                // a return effect directly) in case call.base is undefined or
                // some such and it throws an error
                return {
                    next: new ReturnEffect(
                        Unsafe.getField(call.base,call.offset)
                    )
                };
            });
        }

        return;
    }

    function defaultValueForType<T>(type:Type<T>):anything {
        if(type.is(Type.string)) {
            return "";
        } else if(type.is(Type.number)) {
            return 0;
        } else if(type.is(Type.boolean)) {
            return false;
        } else if(type.is(Type.symbol)) {
            return Symbol();
        } else if(type.is(Type.integer)) {
            return 0;
        } else if(type.is(Type.regexparray)) {
            return [];
        } else {
            throw Util.throwInternalError("defaultValueForType called on unsupported type:",type);
        }
    }

    function prototypeForType<T>(type:Type<T>):object {
        if(type.is(Type.string)) {
            return String.prototype;
        } else if(type.is(Type.number)) {
            return Number.prototype;
        } else if(type.is(Type.boolean)) {
            return Boolean.prototype;
        } else if(type.is(Type.symbol)) {
            return Symbol.prototype;
        } else if(type.is(Type.integer)) {
            return Number.prototype;
        } else if(type.is(Type.regexparray)) {
            return Array.prototype;
        } else {
            throw Util.throwInternalError("prototypeForType called on unsupported type:",type);
        }
    }
}

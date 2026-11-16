namespace TSJ$.PSE.Models {
    export function argumentDecoder(reason:string):Modeler {
        return (call):Effect => {
            return ValueChoosingEffect.from((c) => {
                return new IrreversibleCallEffect(
                    Hook.applyToCallArguments(
                        call,
                        (x) => {
                            return Symbolic.instanceOf(x)
                                ? c(x,reason)
                                : x;
                        }
                    )
                );
            });
        }
    }
}
namespace TSJ$.PSE.Models {
    // also wraps returned values in literal symbols so as to track taint
    export function argumentDecoderWrapper(reason:string):Modeler {
        return (call,context):Effect => {
            let symbolicInput = false;
            return ValueChoosingEffect.from((c) => {
                return IrreversibleEffect.from(():Effect => {
                    const res = Hook.executeCall(Hook.applyToCallArguments(
                        call,
                        (x) => {
                            if(Symbolic.instanceOf(x)) {
                                symbolicInput = true;
                            }
                            return Symbolic.instanceOf(x)
                                ? c(x,reason)
                                : x;
                        }
                    ));
    
                    if(
                        symbolicInput && (
                            integer.is(res) ||
                            typeof res == "string" ||
                            typeof res == "boolean"
                        )
                    ) {
                        return new ReturnEffect(context.encoder.asSymbolic(res));
                    } else {
                        return new ReturnEffect(res);
                    }
                });
            });
        };
    }
}

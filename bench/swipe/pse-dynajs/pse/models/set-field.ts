namespace TSJ$.PSE.Models {
    export const setField:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.SetFieldCall
        ) {

            //REMOVELOG console.log("[-] Encountered a SetFieldCall ...");

            if(
                Symbolic.instanceOf(call.base)
            ) {

                //REMOVELOG console.log("[-] SetFieldCall: setting any field on a primitive is a noop");
                // setting any field on a primitive is a noop
                return new ReturnEffect(call.value);
            } else {
                //REMOVELOG console.log("[-] SetFieldCall: not Symbolic.instanceOf(call.base), call.offset = "+String(call.offset));
                const offset = call.offset;
                if(
                    Symbolic.instanceOf(offset)
                ) {
                    //REMOVELOG console.log("We hit it!:", offset);
                    return ValueChoosingEffect.from((c) => {
                        var val = c(offset,"set_field_symbolic_offset");
                        //REMOVELOG console.log("This is the result of c:", val);
                        return context.model(
                            new Hook.SetFieldCall(
                                call.base,
                                val,
                                call.value
                            )
                        );
                    });
                }
                else{
                    if (Symbolic.instanceOf(call.value)) {
                        //REMOVELOG console.log("[-] Symbolic call.value");
    
                        // call.base would be the actual object
                        let call_base = Object(call.base);
                        let call_offset = String(call.offset);
            
                        if (call_offset == 'innerHTML') {
                            //REMOVELOG console.warn("taint set on sink!", call_base, call_offset);
                            remoteLogger.sendMessage("Found XSS", {
                            href: window.location.href,
                            host: window.location.hostname,
                            });
                        }
    
                        WriteSymbolicField(call_base, call_offset, call.value);
                    } else {
                        //REMOVELOG console.log("[-] concrete call.value");
                        return new IrreversibleCallEffect(call);
                    }
                }
            }
        }
        return;
    }
}

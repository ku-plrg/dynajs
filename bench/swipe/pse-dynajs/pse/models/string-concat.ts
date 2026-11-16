namespace TSJ$.PSE.Models {
    export const String_concat:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_concat &&
            isLikeString(call.base)
        ) 
        {
            // now check if any of the arguments is symbolic
            let calledWSym:boolean = Symbolic.instanceOf(call.base);
            for (var a of call.args) {
                if (calledWSym) break;
                calledWSym = (calledWSym || Symbolic.instanceOf(a));
            }

            if (calledWSym) 
            {
                //REMOVELOG console.log('[+] string-concat: symbolic');
                // need to be able to handle multiple args
                let prev:Like<string> = call.base, cur:Symbolic<string>;
                for (var a of call.args) {
                    if (isLikeString(a))
                    {
                        cur = new Symbols.StringConcat(
                            context.encoder.valueOfHandler,
                            context.encoder.asSymbolicString(prev),
                            context.encoder.asSymbolicString(a),
                        )
                        prev = cur;    
                    }
                }
                return new ReturnEffect(prev);
            }
        }
        return;
    }
}

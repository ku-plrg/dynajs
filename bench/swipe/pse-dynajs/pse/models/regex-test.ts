namespace TSJ$.PSE.Models {
    export const Regex_test:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.Re_test 
        ) {
            
            if (Symbolic.instanceOf(call.base)) 
            {
                //REMOVELOG console.log("symbolic re base");
                return undefined;
            } 

            const searchStr = call.args[0];
            if(
                call.base instanceof RegExp &&
                Symbolic.instanceOf(searchStr)
                && isLikeString(searchStr)
            ) 
            {
                //REMOVELOG console.log('[+] regex-test: symbolic arg');
                return new ReturnEffect(new Symbols.ReTest(
                    context.encoder.valueOfHandler,
                    context.encoder.asSymbolicRegex(call.base),
                    context.encoder.asSymbolicString(searchStr)
                ));

            }
            //console.log("Not symblic:test");
            return undefined;
        }
        return undefined;
    }
}

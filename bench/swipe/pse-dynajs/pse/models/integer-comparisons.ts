namespace TSJ$.PSE.Models {
    export const Integer_comparisons:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.BinaryCall &&
            isLikeInteger(call.left) &&
            isLikeInteger(call.right)
        ) {
            //REMOVELOG console.log('[+] integer-comparisons')
            const left = call.left;
            const right = call.right;
            let symbol;
            if(call.op == ">") {
                symbol = Symbols.IntegerGTSymbol;
            } else if(call.op == ">=") {
                symbol = Symbols.IntegerGTEQSymbol;
            } else if(call.op == "<") {
                symbol = Symbols.IntegerLTSymbol;
            } else if(call.op == "<=") {
                symbol = Symbols.IntegerLTEQSymbol;
            } else {
                return;
            }

            return new ReturnEffect(new symbol(
                context.encoder.valueOfHandler,
                context.encoder.asSymbolicInteger(left),
                context.encoder.asSymbolicInteger(right),
            ));
        }
        return;
    }
}
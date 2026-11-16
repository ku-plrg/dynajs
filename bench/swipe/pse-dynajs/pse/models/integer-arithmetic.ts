namespace TSJ$.PSE.Models {
    export const Integer_arithmetic:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.BinaryCall &&
            isLikeInteger(call.left) &&
            isLikeInteger(call.right) &&
            (Symbolic.instanceOf(call.left) || Symbolic.instanceOf(call.right))
        ) {
            //REMOVELOG console.log('[+] integer-arithmetic: symbolic')
            const left = call.left;
            const right = call.right;
            let symbol;
            if(call.op == "+") {
                symbol = Symbols.IntegerAddition;
            } else if(call.op == "-") {
                symbol = Symbols.IntegerSubtraction;
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

namespace TSJ$.PSE.Models {
    export const typeOf:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.UnaryCall &&
            call.op === "typeof" &&
            Symbolic.instanceOf(call.left)
        ) {
            //REMOVELOG console.log('[+] typeof: symbolic call.left');
            if(call.left.isType(Type.string)) {
                return new ReturnEffect("string");
            } else if(call.left.isType(Type.boolean)) {
                return new ReturnEffect("boolean");
            } else if(
                call.left.isType(Type.integer) ||
                call.left.isType(Type.number)
            ) {
                return new ReturnEffect("number");
            }
            else if (call.left.isType(Type.regexparray)){
                return new ReturnEffect("object");
            }
        }
        return;
    }
}
namespace TSJ$.PSE.Models {
    export const Array_push:PartialModeler = (call:Hook.Call) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.Array_push &&
            !Symbolic.instanceOf(call.base)
        ) {
            //REMOVELOG console.log('[+] array-push: symbolic')
            // we *allow* symbolic arguments to push and we don't want to concretize them
            return new IrreversibleCallEffect(
                call
            );
        }
        return;
    }
}
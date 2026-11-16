namespace TSJ$.PSE.Models {
    export const String_replace_regex:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.args[0] instanceof RegExp &&
            call.f === String.prototype.replace &&
            Config.regex_model
        ) {
            if(
              Symbolic.instanceOf(call.base)
            ) {
                //REMOVELOG console.log("Symbolic:replace")
                return undefined;
            }
            // console.log("Not symblic:replace");
            return undefined;
        }
        return undefined;
    }
}

namespace TSJ$.PSE.Models {
    export const String_search_regex:PartialModeler = (call,context) => {
        if(
            call instanceof Hook.FunctionCall &&
            call.f === Saved.String_search &&
            call.args[0] instanceof RegExp
        ) {

            const pattern = call.args[0]; // type checking cannot track indexed array elements

            if(
              Symbolic.instanceOf(call.base) &&
              isLikeString(call.base) &&
              pattern instanceof RegExp
            ) {

                if (pattern.source === '#|$'){
                    // A good number of websites use this pattern (171 / 10000)
                    return new ReturnEffect(new Symbols.StringIndexOf(
                        context.encoder.valueOfHandler,
                        context.encoder.asSymbolicString(call.base),
                        context.encoder.asSymbolicString('#'),
                        context.encoder.asSymbolicInteger(0)
                    ));
                }

                else if (pattern.source === '[?&]?pubcid_debug=true[&$]?'){
                    // Somewhat common as well (22 / 10000)
                    return new ReturnEffect(new Symbols.StringIndexOf(
                        context.encoder.valueOfHandler,
                        context.encoder.asSymbolicString(call.base),
                        context.encoder.asSymbolicString('pubcid_debug=true'),
                        context.encoder.asSymbolicInteger(0)
                    ));
                }

                else {
                    remoteLogger.sendMessage(
                        "missing_models",
                        {
                            function : "string-search-regex",
                            pattern: pattern.source
                        }
                    );
                }

                // console.log("pattern = "+ pattern);
                // console.log("pattern.source = "+ pattern.source);

                // return new ReturnEffect(new Symbols.StringSearch(
                //     context.encoder.valueOfHandler,
                //     context.encoder.asSymbolicString(call.base),
                //     pattern
                // ));

            }
            // console.log("Not symblic:search");
            return undefined;
        }
        return undefined;
    }
}

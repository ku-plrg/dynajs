namespace TSJ$.PSE.Models {

    // this needs to be lazy, as this file might be loaded before
    // the files that define the modelers. a more appropriate solution
    // would be to use reference directives to the compiler, but that's too hard
    let _modelers:PartialModeler[]|undefined;
    function modelers() {
        if(_modelers === undefined) {
            _modelers = [
                //TODO: efficiently handle the case where no input is symbolic

                // conditional
                Models.conditional,
                
                // setField
                Models.coerciveSetField,
                Models.setField,
        
                // getField
                Models.String_length,
                Models.String_indexing,
                Models.getField,
        
                // unary operators
                Models.typeOf,
                Models.not,

                // binary operators
                Models.strictEquals,
                Models.coerciveEquals,
                Models.Integer_comparisons,
                Models.Integer_arithmetic,
                Models.String_plus,

                // functions
                //TODO: flatten calls to call and apply
                Models.Array_push,
                Models.String_indexOf,
                Models.String_charAt,
                Models.String_startsWith,
                Models.String_concat,
                Models.String_slice,
                Models.String_endsWith,
                Models.String_includes,
                Models.String_substr,
                Models.String_substring,
                Models.String_toLowerCase,      // just passthrough
                Models.String_toUpperCase,      // just passthrough
                Models.String_charCodeAt,       // do one byte for now, lacking unicode support
                Models.String_CodePointAt,      // do one byte for now, lacking unicode support
                Models.String_split_regex,
                Models.String_split_HACK,
                Models.Regex_exec,
                Models.Regex_test,
                Models.String_search_regex,
                Models.String_match_regex,
                //Models.String_replace_regex
                Models.String_split,
            ];
        }

        return _modelers;
    }
    
    export const comprehensive:PartialModeler = (call:Hook.Call,context:ModelingContext) => {
        for(let i = 0; i < modelers().length; i ++) {
            let model:Effect|undefined = modelers()[i](call,context);

            if(model !== undefined) {
                return model;
            }
        }

        return;
    }
}

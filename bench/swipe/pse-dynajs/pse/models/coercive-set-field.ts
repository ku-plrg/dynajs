namespace TSJ$.PSE.Models {
    export const coerciveSetField:PartialModeler = (call,context):Effect|undefined => {
        // TODO: check whether call.value is symbolic and whether
        // we're setting a field on an object that will cause a type
        // coercion (eg, element.href = ...)
        
        // this is where we would avert the issue with ValueOfHandlers
        // (see symbolic.ts) if we were doing things "properly"
        return;
    }
}
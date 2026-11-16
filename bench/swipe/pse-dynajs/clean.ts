/// <reference path="./saved.ts" />

namespace TSJ$.Clean {
    // Usage: safeBind(func,this,arg1,arg2,...)
    export const bind = Saved.call.bind(Saved.bind);

    // This takes some function and transforms it into a function that
    // that takes "this" explicitly as the first argument. For example:
    // "base.func(a,b,c)"" is equivalent to "safe(func)(base,a,b,c)"
    // This is useful because the page could've overridden something like
    // Array.prototype.push, in which case arr.push(x) could cause disaster,
    // which can be averted by using Clean.Array_push(arr,x).
    function safe(f:Function):Function {
        return bind(Saved.call,f);
    }

    export const call = safe(Function.prototype.call);
    export const apply = safe(Function.prototype.apply);

    export const postMessage = safe(window.postMessage);

    export const Object_toString = safe(Object.prototype.toString);

    export const Array_splice = safe(Array.prototype.splice);
    export const Array_push = safe(Array.prototype.push);
    export const Array_pop = safe(Array.prototype.pop);
    export const Array_join = safe(Array.prototype.join);

    export const Map_set = safe(Map.prototype.set);
    export const Map_get = safe(Map.prototype.get);
    export const Map_has = safe(Map.prototype.has);
    export const Map_delete = safe(Map.prototype.delete);
    export const Map_clear = safe(Map.prototype.clear);

    export const XMLHttpRequest_open = safe(XMLHttpRequest.prototype.open);
    export const XMLHttpRequest_send = safe(XMLHttpRequest.prototype.send);

    export const String_substr = safe(String.prototype.substr);
    export const String_replace = safe(String.prototype.replace);
}
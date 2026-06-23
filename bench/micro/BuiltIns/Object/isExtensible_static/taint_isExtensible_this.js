// @type taint
// @target es5 Object.isExtensible
// @feature builtin isExtensible

function __test_taint__(tainted) {
    var o = {p: tainted};
    // @witness boolean result, clean
    __assert_taint__(Object.isExtensible(o), false);
    Object.preventExtensions(o);
    // @witness boolean result, clean
    __assert_taint__(Object.isExtensible(o), false);
}

__test_taint__(__set_taint__('hello'));

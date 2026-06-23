// @type taint
// @target es5 Object.isExtensible
// @feature builtin isExtensible

function __test_taint__(tainted) {
    var o = {p: tainted};
    // @witness Object.isExtensible returns boolean regardless of tainted property
    __assert_taint__(Object.isExtensible(o), false);
    Object.preventExtensions(o);
    __assert_taint__(Object.isExtensible(o), false);
}

__test_taint__(__set_taint__('hello'));

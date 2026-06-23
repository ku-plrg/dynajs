// @type taint
// @target es5 Object.isSealed
// @feature builtin isSealed

function __test_taint__(tainted) {
    var o = {p: tainted};
    // @witness boolean result, clean
    __assert_taint__(Object.isSealed(o), false);
    Object.seal(o);
    // @witness boolean result, clean
    __assert_taint__(Object.isSealed(o), false);
}

__test_taint__(__set_taint__('hello'));

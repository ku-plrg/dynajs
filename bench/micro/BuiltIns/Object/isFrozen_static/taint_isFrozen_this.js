// @type taint
// @target es5 Object.isFrozen
// @feature builtin isFrozen

function __test_taint__(tainted) {
    var o = {p: tainted};
    // @witness boolean result, clean
    __assert_taint__(Object.isFrozen(o), false);
    Object.freeze(o);
    // @witness boolean result, clean
    __assert_taint__(Object.isFrozen(o), false);
}

__test_taint__(__set_taint__('hello'));

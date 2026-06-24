// @type taint
// @target es6+ Object.hasOwn
// @feature builtin hasOwn

function __test_taint__(tainted) {
    var o = {};
    o[tainted] = "v";
    // @witness boolean result, clean
    __assert_taint__(Object.hasOwn(o, tainted), false);
    // @witness boolean result, clean
    __assert_taint__(Object.hasOwn({ p: "v" }, "p"), false);
}

__test_taint__(__set_taint__("hello"));

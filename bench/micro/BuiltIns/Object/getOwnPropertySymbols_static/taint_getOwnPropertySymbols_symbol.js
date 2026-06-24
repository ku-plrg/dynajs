// @type taint
// @target es6+ Object.getOwnPropertySymbols
// @feature builtin getOwnPropertySymbols

function __test_taint__(tainted) {
    var o = {};
    o[Symbol(tainted)] = "v";
    var syms = Object.getOwnPropertySymbols(o);
    // @witness returns a Symbol (not a string value), clean
    __assert_taint__(syms[0], false);
}

__test_taint__(__set_taint__("hello"));

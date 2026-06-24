// @type taint
// @target es6+ Object.groupBy
// @feature builtin groupBy

function __test_taint__(tainted) {
    // callback returns the tainted value, coerced to the property key
    var g = Object.groupBy([1], function () { return tainted; });
    // @witness __test_taint__("a") => Object.keys(g)[0] = "a" tainted
    __assert_taint__(Object.keys(g)[0], true);
}

__test_taint__(__set_taint__("a"));

// @type taint
// @target es6+ Object.groupBy
// @feature builtin groupBy

function __test_taint__(tainted) {
    // items contain a tainted element; grouped into the result object's value arrays
    var g = Object.groupBy([tainted, "clean"], function () { return "g"; });
    var arr = Object.values(g)[0];
    // @witness __test_taint__("a") => Object.values(g)[0][0] = "a" tainted
    __assert_taint__(arr[0], true);
    // @witness clean item grouped alongside, clean
    __assert_taint__(arr[1], false);
}

__test_taint__(__set_taint__("a"));

// @type taint
// @target es6+ Map.groupBy
// @feature builtin groupBy

function __test_taint__(tainted) {
    // items contain a tainted element; grouped into the Map's value arrays
    var g = Map.groupBy([tainted, "clean"], function () { return "g"; });
    var vals = Array.from(g.values());
    // @witness __test_taint__("a") => the tainted item survives into its group, "a" tainted
    __assert_taint__(vals[0][0], true);
    // @witness clean item in its group, clean
    __assert_taint__(vals[1][0], false);
}

__test_taint__(__set_taint__("a"));

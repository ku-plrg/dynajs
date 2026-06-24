// @type taint
// @target es6+ Map.groupBy
// @feature builtin groupBy

function __test_taint__(tainted) {
    // callback returns the tainted value as the grouping key
    var g = Map.groupBy([1], function () { return tainted; });
    var k = Array.from(g.keys())[0];
    // @witness __test_taint__("a") => Array.from(g.keys())[0] = "a" tainted
    __assert_taint__(k, true);
}

__test_taint__(__set_taint__("a"));

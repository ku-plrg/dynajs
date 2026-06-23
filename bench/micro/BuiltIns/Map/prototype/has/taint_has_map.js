// @type taint
// @target es6+ Map.prototype.has
// @feature builtin map-has

function __test_taint__(tainted) {
    // tainted = whole-tainted Map WITH entries (new Map([["k1","v1"],["k2","v2"]]))
    // @witness always tainted.has("k1") returns boolean => clean
    __assert_taint__(tainted.has("k1"), false);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

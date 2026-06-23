// @type taint
// @target es6+ Map.prototype.size
// @feature builtin map-size

function __test_taint__(tainted) {
    // tainted = whole-tainted Map WITH entries (new Map([["k1","v1"],["k2","v2"]]))
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => tainted.size = 2 tainted (count)
    __assert_taint__(tainted.size, true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

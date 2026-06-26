// @type taint
// @target es6+ Map.prototype.set
// @feature builtin map-set
// @done

function __test_taint__(tainted) {
    tainted.set("k3", "clean");
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => tainted = whole map, still tainted
    __assert_taint__(tainted, true);
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => tainted.get("k1") = "v1" tainted
    __assert_taint__(tainted.get("k1"), true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

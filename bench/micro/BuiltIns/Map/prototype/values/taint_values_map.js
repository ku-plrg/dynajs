// @type taint
// @target es6+ Map.prototype.values
// @feature builtin map-values
// @done

function __test_taint__(tainted) {
    var vs = Array.from(tainted.values());
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => vs[0] = "v1" tainted
    __assert_taint__(vs[0], true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

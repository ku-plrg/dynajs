// @type taint
// @target es6+ Map.prototype.keys
// @feature builtin map-keys
// @done

function __test_taint__(tainted) {
    // Map keys are attacker-supplied data => tainted
    var ks = Array.from(tainted.keys());
    // @witness __test_taint__(new Map([["x","v1"],["k2","v2"]])) => ks[0] = "x" tainted
    __assert_taint__(ks[0], true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

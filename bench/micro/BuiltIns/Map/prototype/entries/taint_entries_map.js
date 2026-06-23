// @type taint
// @target es6+ Map.prototype.entries
// @feature builtin map-entries

function __test_taint__(tainted) {
    // tainted = whole-tainted Map WITH entries (new Map([["k1","v1"],["k2","v2"]]))
    var e = Array.from(tainted.entries())[0];
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => e[0] = "k1" tainted (Map key = attacker data)
    __assert_taint__(e[0], true);
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => e[1] = "v1" tainted
    __assert_taint__(e[1], true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

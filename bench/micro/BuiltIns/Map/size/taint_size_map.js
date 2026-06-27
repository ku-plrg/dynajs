// @type taint
// @target es6+ Map.prototype.size
// @feature builtin map-size

function __test_taint__(tainted) {
    // @witness map size = entry count (2), tainted
    __assert_taint__(tainted.size, true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

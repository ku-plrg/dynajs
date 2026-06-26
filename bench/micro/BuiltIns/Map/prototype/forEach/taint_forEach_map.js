// @type taint
// @target es6+ Map.prototype.forEach
// @feature builtin map-forEach
// @done

function __test_taint__(tainted) {
    
    var g;
    tainted.forEach(function(v) { g = v; });
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => g = "v2" tainted
    __assert_taint__(g, true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

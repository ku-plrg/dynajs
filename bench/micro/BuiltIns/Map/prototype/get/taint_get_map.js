// @type taint
// @target es6+ Map.prototype.get
// @feature builtin map-get
// @done

function __test_taint__(tainted) {

    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => tainted.get("k1") = "v1" tainted
    __assert_taint__(tainted.get("k1"), true);
    // @witness always tainted.get("absent") = undefined => not-found, clean
    __assert_taint__(tainted.get("absent"), false);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

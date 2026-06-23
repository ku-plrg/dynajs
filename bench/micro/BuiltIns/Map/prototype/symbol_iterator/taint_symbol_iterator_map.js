// @type taint
// @target es6+ Map.prototype[Symbol.iterator]
// @feature builtin map-symbol_iterator

function __test_taint__(tainted) {
    // tainted = whole-tainted Map WITH entries (new Map([["k1","v1"],["k2","v2"]]))
    // [...m] yields [key, value] pairs
    var first = Array.from(tainted)[0];
    // @witness __test_taint__(new Map([["k1","v1"],["k2","v2"]])) => first[1] = "v1" tainted
    __assert_taint__(first[1], true);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

// @type taint
// @target es6+ Map.prototype.clear
// @feature builtin map-clear
// @done

function __test_taint__(tainted) {
    // tainted = whole-tainted Map WITH entries (new Map([["k1","v1"],["k2","v2"]]))
    var r = tainted.clear();
    // @witness always tainted.clear() returns undefined => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(new Map([["k1", "v1"], ["k2", "v2"]])));

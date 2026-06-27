// @type taint
// @target es6+ Set.prototype.forEach
// @feature builtin set-forEach

function __test_taint__(tainted) {
    var g;
    tainted.forEach(function(v) { g = v; });
    // @witness __test_taint__(new Set(["x","x"])) => g = "x" tainted (last element visited)
    __assert_taint__(g, true);
}

__test_taint__(__set_taint__(new Set(["a", "b"])));

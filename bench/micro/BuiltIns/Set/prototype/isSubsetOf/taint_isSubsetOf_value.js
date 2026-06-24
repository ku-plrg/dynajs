// @type taint
// @target es6+ Set.prototype.isSubsetOf
// @feature builtin isSubsetOf

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);
    var r = s.isSubsetOf(new Set(["x"]));
    // @witness boolean result, clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__("x"));

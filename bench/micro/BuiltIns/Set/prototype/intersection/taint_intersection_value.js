// @type taint
// @target es6+ Set.prototype.intersection
// @feature builtin intersection

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);
    var r = s.intersection(new Set(["x"]));
    var a = Array.from(r);
    // @witness __test_taint__("x") => Array.from(r)[0] = "x" tainted
    __assert_taint__(a[0], true);
}

__test_taint__(__set_taint__("x"));

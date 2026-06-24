// @type taint
// @target es6+ Set.prototype.difference
// @feature builtin difference

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);
    s.add("c");
    var r = s.difference(new Set(["c"]));
    var a = Array.from(r);
    // @witness __test_taint__("x") => Array.from(r)[0] = "x" tainted
    __assert_taint__(a[0], true);
}

__test_taint__(__set_taint__("x"));

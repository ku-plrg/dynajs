// @type taint
// @target es6+ Set.prototype.union
// @feature builtin union

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);
    var r = s.union(new Set(["y"]));
    var a = Array.from(r);
    // @witness __test_taint__("x") => Array.from(r)[0] = "x" tainted
    __assert_taint__(a[0], true);
    // @witness "y" from clean other operand, clean
    __assert_taint__(a[1], false);
}

__test_taint__(__set_taint__("x"));

// @type taint
// @target es6+ Array.of
// @feature builtin array-of_static

function __test_taint__(tainted) {
    var r = Array.of.apply(null, tainted);
    // @witness __test_taint__(["x","x","x"]) => r[0] = "x" tainted (element from tainted spread)
    __assert_taint__(r[0], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

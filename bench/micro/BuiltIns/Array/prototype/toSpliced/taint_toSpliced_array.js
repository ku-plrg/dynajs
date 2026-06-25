// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var r = tainted.toSpliced(0, 1, "q");
    // @witness always r[0] = "q" clean inserted literal
    __assert_taint__(r[0], false);
    // @witness __test_taint__(["x","x","x"]) => r[1] = "x" tainted (remaining element)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

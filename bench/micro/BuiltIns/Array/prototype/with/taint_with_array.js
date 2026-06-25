// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    var r = tainted.with(0, "q");
    // @witness always r[0] = "q" clean replacement literal
    __assert_taint__(r[0], false);
    // @witness __test_taint__(["x","x","x"]) => r[1] = "x" tainted (existing element)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

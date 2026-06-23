// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.with(0, "q");
    // @witness always r[0] = "q" clean replacement literal
    __assert_taint__(r[0], false);
    // @witness __test_taint__(["x","y","z"]) => r[1] = "y" tainted (existing element)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__(["x", "y", "z"]));

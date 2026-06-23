// @type taint
// @target es6+ Array.prototype.keys
// @feature builtin array-keys

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = Array.from(tainted.keys());
    // @witness always r[0] = 0, array index (position) => clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));

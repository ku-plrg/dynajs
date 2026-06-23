// @type taint
// @target es5 Array.isArray
// @feature builtin array-isArray_static

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = Array.isArray(tainted);
    // @witness always Array.isArray returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));

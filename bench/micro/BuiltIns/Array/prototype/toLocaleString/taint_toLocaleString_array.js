// @type taint
// @target es5 Array.prototype.toLocaleString
// @feature builtin array-toLocaleString

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["x","y","z"])
    var r = tainted.toLocaleString();   // "x,y,z"
    // @witness __test_taint__(["x","y","z"]) => r[0] = 'x' tainted (first element char)
    __assert_taint__(r[0], true);
    // @witness r[1] = ',' separator inserted by toLocaleString, clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(["x", "y", "z"]));

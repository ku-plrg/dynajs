// @type taint
// @target es5 Array.isArray
// @feature builtin array-isArray_static

function __test_taint__(tainted) {
    var r = Array.isArray(tainted);
    // @witness always Array.isArray returns boolean => clean
    __assert_taint__(r, false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));

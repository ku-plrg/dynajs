// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.unshift(tainted);
    // @witness always a[2] = "b", clean
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));

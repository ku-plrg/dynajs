// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = ["a", "b"];
    var len = a.unshift(tainted);
    // @witness unshift returns a length (number) => clean
    __assert_taint__(len, false);
    // @witness unshifted tainted item "x" lands at index 0
    __assert_taint__(a[0], true);
    __assert_taint__(a[1], false);
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));

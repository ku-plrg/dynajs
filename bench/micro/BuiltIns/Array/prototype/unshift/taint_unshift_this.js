// @type taint
// @target es6+ Array.prototype.unshift
// @feature builtin array-unshift

function __test_taint__(tainted) {
    var a = [tainted, "b"];
    var len = a.unshift("c");
    // @witness unshift returns a length (number) => clean
    __assert_taint__(len, false);
    __assert_taint__(a[0], false);
    // @witness unshift shifts tainted "x" to index 1
    __assert_taint__(a[1], true);
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));

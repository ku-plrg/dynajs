// @type taint
// @target es6+ Array.prototype.toSorted
// @feature builtin array-toSorted

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.toSorted(function (x, y) { return x < y ? 1 : -1; });
    // @witness toSorted tracks tainted "x" to its sorted position (index 0)
    __assert_taint__(r[0], true);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));

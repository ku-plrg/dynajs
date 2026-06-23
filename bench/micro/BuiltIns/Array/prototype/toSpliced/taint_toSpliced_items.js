// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.toSpliced(1, 1, tainted, "y");
    __assert_taint__(r[0], false);
    // @witness spliced-in tainted item "x" lands at index 1
    __assert_taint__(r[1], true);
    __assert_taint__(r[2], false);
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));

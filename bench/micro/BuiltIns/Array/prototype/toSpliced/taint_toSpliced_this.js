// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d"];
    var r = a.toSpliced(1, 1);
    // @witness toSpliced removes index 1; tainted "x" survives at result [0]
    __assert_taint__(r[0], true);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));

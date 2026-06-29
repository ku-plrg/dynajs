// @type taint
// @target es6+ Array.prototype.toSpliced
// @feature builtin array-toSpliced

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d"];
    var r = a.toSpliced(1, 1);
    // @witness always r[2] = "d", clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));

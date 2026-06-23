// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.with(1, tainted);
    __assert_taint__(r[0], false);
    // @witness with() writes tainted value "x" at index 1
    __assert_taint__(r[1], true);
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));

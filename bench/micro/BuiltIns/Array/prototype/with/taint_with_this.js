// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d"];
    var r = a.with(1, "Z");
    // @witness with() replaces index 1; tainted "x" survives at [0]
    __assert_taint__(r[0], true);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], false);
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));

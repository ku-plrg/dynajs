// @type taint
// @target es6+ Array.prototype.toReversed
// @feature builtin array-toReversed

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.toReversed();
    // @witness toReversed moves tainted "x" from index 0 to the last slot
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], false);
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("hello"));

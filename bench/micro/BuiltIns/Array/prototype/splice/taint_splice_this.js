// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d", "e"];
    a.splice(1, 2);
    // @witness splice removes indices 1..2; tainted "x" survives at index 0
    __assert_taint__(a[0], true);
    __assert_taint__(a[1], false);
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));

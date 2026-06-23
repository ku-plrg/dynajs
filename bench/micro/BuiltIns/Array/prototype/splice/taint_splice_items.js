// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    a.splice(1, 0, tainted, "Y");
    __assert_taint__(a[0], false);
    // @witness spliced-in tainted item "x" lands at index 1
    __assert_taint__(a[1], true);
    __assert_taint__(a[2], false);
}

__test_taint__(__set_taint__("hello"));

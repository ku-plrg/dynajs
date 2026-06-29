// @type taint
// @target es6+ Array.prototype.toReversed
// @feature builtin array-toReversed

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var r = a.toReversed();
    // @witness always r[0] = "c", clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__("hello"));

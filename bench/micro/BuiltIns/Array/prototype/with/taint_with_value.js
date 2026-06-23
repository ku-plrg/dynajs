// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.with(1, tainted);
    // @witness always r[0] = "a", clean
    __assert_taint__(r[0], false);
    // @witness __test_taint__('hello') => r[1] = 'hello' tainted
    __assert_taint__(r[1], true);
    // @witness always r[2] = "c", clean
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__("hello"));

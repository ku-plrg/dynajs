// @type taint
// @target es6+ Array.prototype.with
// @feature builtin array-with

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d"];
    var r = a.with(1, "Z");
    // @witness __test_taint__('hello') => r[0] = 'hello' tainted
    __assert_taint__(r[0], true);
    // @witness always r[1] = "Z", clean
    __assert_taint__(r[1], false);
    // @witness always r[2] = "c", clean
    __assert_taint__(r[2], false);
    // @witness always r[3] = "d", clean
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__("hello"));
